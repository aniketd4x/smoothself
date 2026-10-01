const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  tagline: {
    type: String,
    default: ''
  },
  buttonText: {
    type: String,
    default: 'Shop Collection'
  },
  buttonLink: {
    type: String,
    default: '/shop'
  },
  imageUrl: {
    type: String,
    required: true
  },
  mobileImageUrl: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Banner', bannerSchema);
