const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./config/db');

// Disconnected MongoDB; initialize Supabase connection
connectDB();

const app = express();

// Core middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/razorpay', require('./routes/razorpayRoutes'));

// Serve uploaded files statically
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', brand: 'SmoothSelf', timestamp: new Date() });
});

// Serve frontend build if exists
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Route Not Found' });
  }
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('API Server is running. Client build in progress.');
    }
  });
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL && require.main === module) {
  app.listen(PORT, () => {
    console.log(`[SmoothSelf Server] Running on http://localhost:${PORT}`);
  });
}

module.exports = app;
