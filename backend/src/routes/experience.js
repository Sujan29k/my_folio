const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM experience ORDER BY display_order');
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { company, role, description, start_date, end_date, logo_url, display_order } = req.body;
  const result = await pool.query(
    'INSERT INTO experience (company, role, description, start_date, end_date, logo_url, display_order) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [company, role, description, start_date, end_date, logo_url, display_order]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { company, role, description, start_date, end_date, logo_url } = req.body;
  const result = await pool.query(
    'UPDATE experience SET company=$1, role=$2, description=$3, start_date=$4, end_date=$5, logo_url=$6 WHERE id=$7 RETURNING *',
    [company, role, description, start_date, end_date, logo_url, req.params.id]
  );
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM experience WHERE id=$1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

module.exports = router;