const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const ext = req.file.originalname.split('.').pop();
    const filename = `test-${Date.now()}.${ext}`;

    console.log('Attempting upload...');
    console.log('Filename:', filename);
    console.log('Mimetype:', req.file.mimetype);
    console.log('Size:', req.file.size);

    // First list buckets to verify connection
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    console.log('Buckets:', JSON.stringify(buckets));
    console.log('Bucket error:', bucketError);

    const { data, error } = await supabase.storage
      .from('Portfolio_images')
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    console.log('Upload data:', JSON.stringify(data));
    console.log('Upload error:', JSON.stringify(error));

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('Portfolio_images')
      .getPublicUrl(filename);

    res.json({ url: urlData.publicUrl });

  } catch (err) {
    console.error('Full error:', JSON.stringify(err));
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;