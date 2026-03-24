const Parser = require('rss-parser');
const pool = require('../db');
const { generateBriefAndCategory } = require('../services/claude');

const parser = new Parser({
  customFields: {
    item: [['content:encoded', 'contentEncoded']],
  },
});

async function pollSubstack() {
  const { rows: authors } = await pool.query(
    'SELECT id, name, substack_slug FROM authors WHERE substack_slug IS NOT NULL'
  );

  if (authors.length === 0) {
    console.log('[Substack] No authors to poll.');
    return;
  }

  for (const author of authors) {
    const feedUrl = `https://${author.substack_slug}.substack.com/feed`;
    console.log(`[Substack] Polling ${author.name} at ${feedUrl}`);

    try {
      const feed = await parser.parseURL(feedUrl);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);

      for (const item of feed.items.slice(0, 5)) {
        const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
        if (publishedAt < cutoff) continue;
        const url = item.link;
        if (!url) continue;

        // Dedup check
        const { rows } = await pool.query(
          'SELECT id FROM articles WHERE external_id = $1',
          [url]
        );
        if (rows.length > 0) continue;

        const rawContent = item.contentEncoded || item.content || item.summary || '';

        // Generate brief + auto-classify category
        const { brief, category } = await generateBriefAndCategory(item.title, rawContent);

        await pool.query(
          `INSERT INTO articles
             (author_id, external_id, title, content, ai_brief, category, source, source_url, published_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'substack', $7, $8)`,
          [author.id, url, item.title, rawContent, brief, category, url, publishedAt]
        );

        console.log(`[Substack] ✓ Ingested: "${item.title}"`);
      }
    } catch (err) {
      console.error(`[Substack] Error polling ${author.name}:`, err.message);
    }
  }
}

module.exports = { pollSubstack };
