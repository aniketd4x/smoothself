const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  brandName: { type: String, default: 'SmoothSelf' },
  tagline: { type: String, default: '' },
  logoUrl: { type: String, default: '/logo.webp' },
  faviconUrl: { type: String, default: '' },
  announcementText: { type: String, default: 'Free shipping order above ₹ 450' },
  announcementActive: { type: Boolean, default: true },
  freeShippingThreshold: { type: Number, default: 450 },
  standardShippingFee: { type: Number, default: 50 },
  expressShippingFee: { type: Number, default: 100 },
  taxPercentage: { type: Number, default: 0 }, // Prices are tax included
  contactEmail: { type: String, default: 'support@smoothself.in' },
  contactPhone: { type: String, default: '+91 99604 42750' },
  contactAddress: { type: String, default: 'Mumbai, Maharashtra' },
  currency: { type: String, default: 'INR' },
  currencySymbol: { type: String, default: '₹' },
  instagramUrl: { type: String, default: 'https://instagram.com/' },
  facebookUrl: { type: String, default: 'https://facebook.com/' },
  twitterUrl: { type: String, default: 'https://twitter.com/' },
  pinterestUrl: { type: String, default: 'https://pinterest.com/' },
  primaryColor: { type: String, default: '#332d55' },
  secondaryColor: { type: String, default: '#9a84c8' },
  accentColor: { type: String, default: '#da3f3f' },
  aboutUsTitle: { type: String, default: 'Crafted with Purity, Science & Nature' },
  aboutUsText: {
    type: String,
    default: 'SmoothSelf was created to redefine mindful self-care. We craft ultra-nourishing, lightweight personal care products infused with restorative botanical extracts, plant oils, and clinical actives like Vitamin E and Hyaluronic Acid to reveal soft, glowing, hydrated skin every single day.'
  },
  privacyPolicy: {
    type: String,
    default: 'We take your privacy seriously. All personal information collected during checkout or account creation is encrypted and safeguarded. We do not sell or share customer data with third parties.'
  },
  refundPolicy: {
    type: String,
    default: 'We offer 30-Day Hassle-Free Returns. Return or exchange your order within 30 days of delivery. Shop with complete confidence and peace of mind on every order.'
  },
  shippingPolicy: {
    type: String,
    default: 'Orders are dispatched within 24 to 48 business hours. Delivery timelines are 2-5 business days across India. Free shipping applies automatically to all orders above ₹450.'
  },
  termsOfService: {
    type: String,
    default: 'By purchasing from our store, you agree to our terms of service, which govern the sale of products and use of our e-commerce platform.'
  },
  newsletterHeading: { type: String, default: 'Let’s get in touch' },
  newsletterSubheading: { type: String, default: 'Sign up with your email address to receive news and updates, special drops, and exclusive discounts.' }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
