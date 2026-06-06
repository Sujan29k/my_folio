const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all projects
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM projects ORDER BY display_order');
  res.json(result.rows);
});

// Add a project
router.post('/', async (req, res) => {
  const { title, description, tech_stack, live_url, github_url, image_url, display_order } = req.body;
  const result = await pool.query(
    'INSERT INTO projects (title, description, tech_stack, live_url, github_url, image_url, display_order) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [title, description, tech_stack, live_url, github_url, image_url, display_order]
  );
  res.status(201).json(result.rows[0]);
});

// Update a project
router.put('/:id', async (req, res) => {
  const { title, description, tech_stack, live_url, github_url, image_url } = req.body;
  const result = await pool.query(
    'UPDATE projects SET title=$1, description=$2, tech_stack=$3, live_url=$4, github_url=$5, image_url=$6 WHERE id=$7 RETURNING *',
    [title, description, tech_stack, live_url, github_url, image_url, req.params.id]
  );
  res.json(result.rows[0]);
});

// Delete a project
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM projects WHERE id=$1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

module.exports = router;