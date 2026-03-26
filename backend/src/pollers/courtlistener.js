const axios = require('axios');
const pool = require('../db');
const { generateBriefAndCategory } = require('../services/claude');

const BASE_URL = 'https://www.courtlistener.com/api/rest/v4';

async function pollCourtListener() {
  console.log('[CourtListener] Polling for recent opinions...');

  try {
    const { data } = await axios.get(`${BASE_URL}/clusters/`, {
      params: {
        order_by: '-date_filed',
        page_size: 5,
      },
      headers: {
        'User-Agent': 'GovWatch/1.0 (news aggregator)',
        ...(process.env.COURTLISTENER_API_KEY && {
          Authorization: `Token ${process.env.COURTLISTENER_API_KEY}`,
        }),
      },
      timeout: 10000,
    });

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    for (const cluster of data.results || []) {
      const publishedAt = cluster.date_filed ? new Date(cluster.date_filed) : new Date();
      if (publishedAt < cutoff) continue;

      const externalId = `courtlistener-${cluster.id}`;

      const { rows } = await pool.query(
        'SELECT id FROM articles WHERE external_id = $1',
        [externalId]
      );
      if (rows.length > 0) continue;

      const title = cluster.case_name || `Court Opinion #${cluster.id}`;
      const content = cluster.syllabus || cluster.case_name || '';
      const sourceUrl = cluster.absolute_url
        ? `https://www.courtlistener.com${cluster.absolute_url}`
        : null;

      const { brief, category } = await generateBriefAndCategory(title, content);

      await pool.query(
        `INSERT INTO articles
           (external_id, title, content, ai_brief, category, source, source_url, published_at)
         VALUES ($1, $2, $3, $4, $5, 'courtlistener', $6, $7)`,
        [externalId, title, content, brief, category || 'court_rulings', sourceUrl, publishedAt]
      );

      console.log(`[CourtListener] ✓ Ingested: "${title}"`);
    }
  } catch (err) {
    console.error('[CourtListener] Error:', err.message);
  }
}

module.exports = { pollCourtListener };
