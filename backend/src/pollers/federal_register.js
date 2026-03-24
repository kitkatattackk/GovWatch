const axios = require('axios');
const pool = require('../db');
const { generateBriefAndCategory } = require('../services/claude');

const BASE_URL = 'https://www.federalregister.gov/api/v1';

async function pollFederalRegister() {
  console.log('[FederalRegister] Polling for executive orders...');

  try {
    const { data } = await axios.get(`${BASE_URL}/documents.json`, {
      params: {
        'conditions[type][]': 'PRESDOCU',
        'conditions[presidential_document_type][]': 'executive_order',
        'order': 'newest',
        'per_page': 5,
        'fields[]': [
          'document_number',
          'title',
          'abstract',
          'html_url',
          'publication_date',
          'signing_date',
          'executive_order_number',
        ],
      },
      timeout: 10000,
    });

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    for (const doc of data.results || []) {
      const publishedAt = doc.signing_date
        ? new Date(doc.signing_date)
        : new Date(doc.publication_date);
      if (publishedAt < cutoff) continue;

      const externalId = `federal-register-${doc.document_number}`;

      const { rows } = await pool.query(
        'SELECT id FROM articles WHERE external_id = $1',
        [externalId]
      );
      if (rows.length > 0) continue;

      const title = doc.executive_order_number
        ? `Executive Order ${doc.executive_order_number}: ${doc.title}`
        : doc.title;

      const content = doc.abstract || doc.title;
      const { brief } = await generateBriefAndCategory(title, content);

      const publishedAt = doc.signing_date
        ? new Date(doc.signing_date)
        : new Date(doc.publication_date);
      await pool.query(
        `INSERT INTO articles
           (external_id, title, content, ai_brief, category, source, source_url, published_at)
         VALUES ($1, $2, $3, $4, 'executive_orders', 'federal_register', $5, $6)`,
        [externalId, title, content, brief, doc.html_url, publishedAt]
      );

      console.log(`[FederalRegister] ✓ Ingested: "${title}"`);
    }
  } catch (err) {
    console.error('[FederalRegister] Error:', err.message);
  }
}

module.exports = { pollFederalRegister };
