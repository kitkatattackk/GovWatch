const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /api/digest
// Returns last 24 hours of articles grouped by category with counts.
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         a.id,
         a.title,
         a.ai_brief,
         a.category,
         a.source,
         a.source_url,
         a.published_at,
         a.created_at,
         au.name          AS author_name,
         au.substack_slug AS author_slug
       FROM articles a
       LEFT JOIN authors au ON a.author_id = au.id
       WHERE a.created_at > NOW() - INTERVAL '24 hours'
       ORDER BY a.category, a.published_at DESC NULLS LAST`
    );

    const grouped = {};
    for (const article of rows) {
      const cat = article.category || 'uncategorized';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(article);
    }

    const digest = Object.entries(grouped).map(([category, articles]) => ({
      category,
      count: articles.length,
      articles,
    }));

    res.json({ digest, total: rows.length });
  } catch (err) {
    console.error('[GET /api/digest]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/digest/today
// Returns today's pre-computed AI summaries + article lists per category.
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Pre-computed summaries
    const { rows: summaries } = await pool.query(
      `SELECT category, summary, article_count, created_at
       FROM digests
       WHERE digest_date = $1
       ORDER BY category`,
      [today]
    );

    // Full article list for today
    const { rows: articles } = await pool.query(
      `SELECT
         a.id,
         a.title,
         a.ai_brief,
         a.category,
         a.source_url,
         a.published_at,
         au.name AS author_name
       FROM articles a
       LEFT JOIN authors au ON a.author_id = au.id
       WHERE a.created_at > NOW() - INTERVAL '24 hours'
       ORDER BY a.category, a.published_at DESC NULLS LAST`
    );

    // Merge summaries with article lists
    const articlesByCategory = {};
    for (const a of articles) {
      const cat = a.category || 'uncategorized';
      if (!articlesByCategory[cat]) articlesByCategory[cat] = [];
      articlesByCategory[cat].push(a);
    }

    const digest = summaries.map((s) => ({
      category:      s.category,
      summary:       s.summary,
      article_count: s.article_count,
      generated_at:  s.created_at,
      articles:      articlesByCategory[s.category] || [],
    }));

    res.json({ date: today, digest, total: articles.length });
  } catch (err) {
    console.error('[GET /api/digest/today]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
