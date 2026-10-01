const mongoose = require('mongoose');

const variantOptionSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g. "200ml", "400ml" or "Vanilla Orchid"
  sku: { type: String, default: '' },
  price: { type: Number, required: true },
  compareAtPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 50 },
  image: { type: String, default: '' }
});

const variantGroupSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Size", "Scent"
  options: [variantOptionSchema]
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  categoryName: {
    type: String,
    default: ''
  },
  shortDescription: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  ingredients: {
    type: String,
    default: ''
  },
  howToUse: {
    type: String,
    default: ''
  },
  benefits: [{
    title: String,
    description: String
  }],
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  compareAtPrice: {
    type: Number,
    default: 0
  },
  costPrice: {
    type: Number,
    default: 0
  },
  sku: {
    type: String,
    default: ''
  },
  barcode: {
    type: String,
    default: ''
  },
  stock: {
    type: Number,
    required: true,
    default: 100,
    min: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  images: [{
    type: String
  }],
  variants: [variantGroupSchema],
  badges: [{
    type: String, // e.g. "BESTSELLER", "HOT", "NEW", "SALE", "CLEAN BEAUTY"
    trim: true
  }],
  rating: {
    type: Number,
    default: 4.9,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  seoTitle: {
    type: String,
    default: ''
  },
  seoDescription: {
    type: String,
    default: ''
  },
  weight: {
    type: String,
    default: '200ml'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Product', productSchema);
