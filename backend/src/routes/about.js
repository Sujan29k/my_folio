const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get skills
router.get('/skills', async (req, res) => {
  const result = await pool.query('SELECT * FROM skills');
  res.json(result.rows);
});

router.post('/skills', async (req, res) => {
  const { category, items } = req.body;
  const result = await pool.query(
    'INSERT INTO skills (category, items) VALUES ($1,$2) RETURNING *',
    [category, items]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/skills/:id', async (req, res) => {
  const { category, items } = req.body;
  const result = await pool.query(
    'UPDATE skills SET category=$1, items=$2 WHERE id=$3 RETURNING *',
    [category, items, req.params.id]
  );
  res.json(result.rows[0]);
});

router.delete('/skills/:id', async (req, res) => {
  await pool.query('DELETE FROM skills WHERE id=$1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

// GET resume url
router.get('/resume', async (req, res) => {
  try {
    const result = await pool.query('SELECT resume_url FROM about LIMIT 1');
    res.json(result.rows[0] || { resume_url: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update resume url
router.put('/resume', async (req, res) => {
  const { resume_url } = req.body;
  try {
    const exists = await pool.query('SELECT id FROM about LIMIT 1');
    let result;
    if (exists.rows.length === 0) {
      result = await pool.query(
        'INSERT INTO about (bio, resume_url) VALUES ($1,$2) RETURNING *',
        ['', resume_url]
      );
    } else {
      result = await pool.query(
        'UPDATE about SET resume_url=$1 WHERE id=$2 RETURNING *',
        [resume_url, exists.rows[0].id]
      );
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;