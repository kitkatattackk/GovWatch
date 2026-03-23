const axios = require('axios');
const pool = require('../db');
const { generateBriefAndCategory } = require('../services/claude');

const BASE_URL = 'https://api.usaspending.gov/api/v2';

// Get the date 30 days ago as YYYY-MM-DD
function thirtyDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}

async function pollUSASpending() {
  console.log('[USASpending] Polling for large recent awards...');

  try {
    const { data } = await axios.post(
      `${BASE_URL}/search/spending_by_award/`,
      {
        filters: {
          time_period: [{ start_date: thirtyDaysAgo(), end_date: new Date().toISOString().split('T')[0] }],
          award_type_codes: ['A', 'B', 'C', 'D'], // contracts
          award_amounts: [{ lower_bound: 100000000 }], // >= $100M
        },
        fields: [
          'Award ID',
          'Recipient Name',
          'Award Amount',
          'Awarding Agency',
          'Awarding Sub Agency',
          'Description',
          'Start Date',
          'generated_internal_id',
        ],
        sort: 'Award Amount',
        order: 'desc',
        limit: 15,
        page: 1,
      },
      { timeout: 15000 }
    );

    for (const award of data.results || []) {
      const externalId = `usaspending-${award['Award ID'] || award.generated_internal_id}`;

      const { rows } = await pool.query(
        'SELECT id FROM articles WHERE external_id = $1',
        [externalId]
      );
      if (rows.length > 0) continue;

      const amount = award['Award Amount']
        ? `$${(award['Award Amount'] / 1e9).toFixed(2)}B`
        : 'Undisclosed amount';

      const agency = award['Awarding Sub Agency'] || award['Awarding Agency'] || 'Federal Agency';
      const recipient = award['Recipient Name'] || 'Undisclosed Recipient';
      const description = award['Description'] || 'Federal contract award';

      const title = `${agency} Awards ${amount} Contract to ${recipient}`;
      const content = `${agency} has awarded a ${amount} contract to ${recipient}. ${description}`;

      const { brief } = await generateBriefAndCategory(title, content);

      const sourceUrl = award.generated_internal_id
        ? `https://www.usaspending.gov/award/${award.generated_internal_id}`
        : null;

      const publishedAt = award['Start Date']
        ? new Date(award['Start Date'])
        : new Date();

      await pool.query(
        `INSERT INTO articles
           (external_id, title, content, ai_brief, category, source, source_url, published_at)
         VALUES ($1, $2, $3, $4, 'government_spending', 'usaspending', $5, $6)`,
        [externalId, title, content, brief, sourceUrl, publishedAt]
      );

      console.log(`[USASpending] ✓ Ingested: "${title}"`);
    }
  } catch (err) {
    console.error('[USASpending] Error:', err.message);
  }
}

module.exports = { pollUSASpending };
