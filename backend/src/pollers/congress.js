const axios = require('axios');
const pool = require('../db');
const { generateBriefAndCategory } = require('../services/claude');

const BASE_URL = 'https://api.congress.gov/v3';

async function pollCongress() {
  const apiKey = process.env.CONGRESS_API_KEY;
  if (!apiKey) {
    console.warn('[Congress] CONGRESS_API_KEY not set — skipping.');
    return;
  }

  console.log('[Congress] Polling for recent bills...');

  try {
    const { data } = await axios.get(`${BASE_URL}/bill`, {
      params: {
        sort: 'updateDate+desc',
        limit: 20,
        api_key: apiKey,
      },
      timeout: 10000,
    });

    for (const bill of data.bills || []) {
      const externalId =
        bill.url || `congress-${bill.congress}-${bill.type}-${bill.number}`;

      // Dedup check
      const { rows } = await pool.query(
        'SELECT id FROM articles WHERE external_id = $1',
        [externalId]
      );
      if (rows.length > 0) continue;

      const title =
        bill.title || `${bill.type || 'Bill'} ${bill.number}`;
      const latestAction = bill.latestAction
        ? `Latest action: ${bill.latestAction.text} (${bill.latestAction.actionDate})`
        : '';
      const content = [title, latestAction].filter(Boolean).join('. ');

      // Bills are always bills_votes — skip category auto-detection
      const { brief } = await generateBriefAndCategory(title, content);

      const publishedAt = bill.updateDate ? new Date(bill.updateDate) : new Date();

      await pool.query(
        `INSERT INTO articles
           (external_id, title, content, ai_brief, category, source, source_url, published_at)
         VALUES ($1, $2, $3, $4, 'bills_votes', 'congress', $5, $6)`,
        [externalId, title, content, brief, bill.url || null, publishedAt]
      );

      console.log(`[Congress] ✓ Ingested: "${title}"`);
    }
  } catch (err) {
    console.error('[Congress] Error:', err.message);
  }
}

module.exports = { pollCongress };
