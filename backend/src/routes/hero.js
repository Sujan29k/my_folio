const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  // Always return the first row ordered by id for consistency
  const result = await pool.query('SELECT * FROM hero ORDER BY id LIMIT 1');
  res.json(result.rows[0]);
});

router.put('/', async (req, res) => {
  const { name, subtitle, image_url, github_url } = req.body;
  // Get the actual first row's id instead of hardcoding id=1
  const first = await pool.query('SELECT id FROM hero ORDER BY id LIMIT 1');
  if (!first.rows[0]) return res.status(404).json({ error: 'No hero row found' });
  const id = first.rows[0].id;
  const result = await pool.query(
    'UPDATE hero SET name=$1, subtitle=$2, image_url=$3, github_url=$4 WHERE id=$5 RETURNING *',
    [name, subtitle, image_url, github_url, id]
  );
  res.json(result.rows[0]);
});

module.exports = router;