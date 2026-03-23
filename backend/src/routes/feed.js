const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /api/feed
// Query params: ?category=bills_votes&limit=20&offset=0
router.get('/', async (req, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;

    const params = [];
    let where = '';

    if (category) {
      params.push(category);
      where = `WHERE a.category = $${params.length}`;
    }

    params.push(parseInt(limit, 10), parseInt(offset, 10));

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
         au.name        AS author_name,
         au.substack_slug AS author_slug,
         au.avatar_url  AS author_avatar
       FROM articles a
       LEFT JOIN authors au ON a.author_id = au.id
       ${where}
       ORDER BY a.published_at DESC NULLS LAST
       LIMIT $${params.length - 1}
       OFFSET $${params.length}`,
      params
    );

    res.json({ articles: rows, count: rows.length });
  } catch (err) {
    console.error('[GET /api/feed]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/articles/:id
router.get('/articles/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         a.id,
         a.title,
         a.content,
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
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[GET /api/articles/:id]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
