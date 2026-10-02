const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOnly } = require('../middleware/auth');
const { getSupabase } = require('../config/supabase');

// Use memory storage so Vercel's read-only filesystem is not an issue
const storage = multer.memoryStorage();

// File validation
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|avif/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimetypeValid = allowed.test(file.mimetype);
  const extnameValid = allowed.test(ext);

  if (mimetypeValid || extnameValid) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpg, jpeg, png, webp, gif, avif) are allowed!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter
});

const BUCKET = 'product-images'; // Your Supabase Storage bucket name

/**
 * Upload a single buffer to Supabase Storage and return the public URL.
 */
async function uploadToSupabase(buffer, originalName, mimeType) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase is not configured. Check SUPABASE_URL and SUPABASE_ANON_KEY in .env');

  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const cleanName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 30);
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  const filename = `${cleanName}-${uniqueSuffix}${ext}`;

  const { error } = await sb.storage
    .from(BUCKET)
    .upload(filename, buffer, {
      contentType: mimeType || 'image/jpeg',
      upsert: false
    });

  if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);

  const { data: publicData } = sb.storage.from(BUCKET).getPublicUrl(filename);
  return publicData.publicUrl;
}

// POST /api/upload — Single image upload
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    const url = await uploadToSupabase(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.json({ success: true, url, filename: path.basename(url), size: req.file.size });
  } catch (error) {
    console.error('[Upload Error]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/upload/multiple — Multiple images upload
router.post('/multiple', protect, adminOnly, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files provided' });
    }

    const urls = await Promise.all(
      req.files.map(file => uploadToSupabase(file.buffer, file.originalname, file.mimetype))
    );

    res.json({
      success: true,
      urls,
      files: req.files.map((f, i) => ({ url: urls[i], filename: path.basename(urls[i]), size: f.size }))
    });
  } catch (error) {
    console.error('[Upload Error]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
