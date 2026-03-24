const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /api/authors — list all followed authors
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, substack_slug, avatar_url, bio, created_at FROM authors ORDER BY name'
    );
    res.json({ authors: rows });
  } catch (err) {
    console.error('[GET /api/authors]', err.message);
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

// POST /api/authors — add a new author by Substack slug
// Body: { name: "Matt Yglesias", substack_slug: "mattyglesias" }
router.post('/', async (req, res) => {
  const { name, substack_slug } = req.body;

  if (!name || !substack_slug) {
    return res.status(400).json({ error: 'name and substack_slug are required' });
  }

  // Normalize slug: strip URL down to just the subdomain if a full URL was provided
  const slug = substack_slug
    .replace(/https?:\/\//i, '')
    .replace(/\.substack\.com.*/, '')
    .trim();

  try {
    const { rows } = await pool.query(
      `INSERT INTO authors (name, substack_slug)
       VALUES ($1, $2)
       ON CONFLICT (substack_slug) DO NOTHING
       RETURNING *`,
      [name.trim(), slug]
    );

    if (rows.length === 0) {
      return res.status(409).json({ error: 'Author with that slug already exists' });
    }

    res.status(201).json({ author: rows[0] });
  } catch (err) {
    console.error('[POST /api/authors]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/authors/:id — unfollow an author
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM authors WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/authors]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
