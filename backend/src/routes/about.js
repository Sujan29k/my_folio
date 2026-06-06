const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get skills grouped by category
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

module.exports = router;