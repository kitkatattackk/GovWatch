const Anthropic = require('@anthropic-ai/sdk');
const pool = require('../db');

const client = new Anthropic();

const CATEGORY_LABELS = {
  bills_votes:          'Bills & Votes',
  executive_orders:     'Executive Orders',
  court_rulings:        'Court Rulings',
  government_spending:  'Government Spending',
};

/**
 * Generates and stores a daily digest for a given date (defaults to today).
 * For each category, queries the last 24h of articles, sends them to Claude,
 * and stores a summary paragraph in the digests table.
 */
async function generateDailyDigest(date = new Date()) {
  const digestDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
  console.log(`[Digest] Generating digest for ${digestDate}...`);

  for (const [category, label] of Object.entries(CATEGORY_LABELS)) {
    // Fetch articles for this category from the last 24 hours
    const { rows: articles } = await pool.query(
      `SELECT title, ai_brief, author_id,
              (SELECT name FROM authors WHERE id = author_id) AS author_name
       FROM articles
       WHERE category = $1
         AND created_at > NOW() - INTERVAL '24 hours'
       ORDER BY published_at DESC`,
      [category]
    );

    if (articles.length === 0) {
      console.log(`[Digest] No articles for ${label} — skipping.`);
      continue;
    }

    // Build a compact article list for Claude
    const articleList = articles
      .map((a, i) => {
        const author = a.author_name ? ` (${a.author_name})` : '';
        return `${i + 1}. ${a.title}${author}\n   ${a.ai_brief || ''}`;
      })
      .join('\n\n');

    console.log(`[Digest] Writing ${label} summary (${articles.length} articles)...`);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 350,
      messages: [
        {
          role: 'user',
          content: `You write the daily digest for GovWatch, a serious political news app.

Write a 3-4 sentence summary of today's "${label}" news based on these articles. Be direct and factual — focus on the most significant developments and what they mean for citizens. No filler, no headlines, just a tight paragraph.

Articles:
${articleList}`,
        },
      ],
    });

    const summary = response.content[0].text.trim();

    // Upsert — if digest already exists for this date/category, update it
    await pool.query(
      `INSERT INTO digests (digest_date, category, summary, article_count)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (digest_date, category)
       DO UPDATE SET summary = $3, article_count = $4, created_at = NOW()`,
      [digestDate, category, summary, articles.length]
    );

    console.log(`[Digest] ✓ ${label} summary saved.`);
  }

  console.log(`[Digest] ✓ Digest for ${digestDate} complete.`);
}

module.exports = { generateDailyDigest };
