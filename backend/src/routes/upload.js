const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    realtime: {
      transport: ws,
    },
  }
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const valid = allowed.test(file.mimetype) || allowed.test(file.originalname);
    if (valid) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const ext = req.file.originalname.split('.').pop();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

    const { data, error } = await supabase.storage
      .from('Portfolio_images')
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('Portfolio_images')
      .getPublicUrl(filename);

    res.json({ url: urlData.publicUrl });

  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;