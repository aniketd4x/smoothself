const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, adminOnly } = require('../middleware/auth');
const { getSupabase } = require('../config/supabase');

// Use memory storage
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

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';

/**
 * Save image locally to public/uploads/ as a resilient fallback
 */
function saveLocally(buffer, originalName) {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const cleanName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 30);
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  const filename = `${cleanName}-${uniqueSuffix}${ext}`;

  const publicUploads = path.resolve(__dirname, '../../public/uploads');
  if (!fs.existsSync(publicUploads)) {
    fs.mkdirSync(publicUploads, { recursive: true });
  }
  fs.writeFileSync(path.join(publicUploads, filename), buffer);

  const rootUploads = path.resolve(__dirname, '../../uploads');
  if (fs.existsSync(rootUploads)) {
    try {
      fs.writeFileSync(path.join(rootUploads, filename), buffer);
    } catch (_) {}
  }

  return `/uploads/${filename}`;
}

/**
 * Upload a single buffer to Supabase Storage, with automatic local fallback
 */
async function uploadImage(buffer, originalName, mimeType) {
  const sb = getSupabase();

  if (sb) {
    try {
      const ext = path.extname(originalName).toLowerCase() || '.jpg';
      const cleanName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 30);
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      const filename = `${cleanName}-${uniqueSuffix}${ext}`;

      const { data, error } = await sb.storage
        .from(BUCKET)
        .upload(filename, buffer, {
          contentType: mimeType || 'image/jpeg',
          upsert: false
        });

      if (!error && data) {
        const { data: publicData } = sb.storage.from(BUCKET).getPublicUrl(filename);
        if (publicData?.publicUrl) {
          return publicData.publicUrl;
        }
      } else {
        console.warn(`[Storage Warning] Supabase upload failed (${error?.message || 'Unknown error'}). Using local fallback.`);
      }
    } catch (err) {
      console.warn(`[Storage Warning] Supabase upload error: ${err.message}. Using local fallback.`);
    }
  }

  // Fallback to reliable local file storage
  return saveLocally(buffer, originalName);
}

// POST /api/upload — Single image upload
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    const url = await uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype);
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
      req.files.map(file => uploadImage(file.buffer, file.originalname, file.mimetype))
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
