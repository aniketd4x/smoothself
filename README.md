# Aura Botanica — Luxury Botanical Skincare E-Commerce Platform

A production-ready e-commerce platform crafted with the visual and UX structure inspired by [smoothself.in](https://smoothself.in/), tailored with a high-end luxury brand identity (**Aura Botanica**), clean plant formulations, and a complete relational MongoDB-backed API architecture and Admin Panel.

---

## 🌟 Highlights & Architecture

### 1. Frontend & UX (Faithful Re-creation of Reference UX)
- **Top Announcement Bar:** Dismissible with promo highlight ("Free shipping on orders above ₹450").
- **Sticky Minimalist Header:** Brand logo, navigation menu, predictive search modal trigger, customer account dropdown, wishlist icon with count badge, and shopping bag trigger with real-time count & subtotal.
- **Hero Slideshow:** Auto-playing smooth slides with luxury typography, pill tags, and CTA buttons ("Shop Collection").
- **Value Proposition Bar (Icon Box):** Highlights "Deep Skin Hydration", "Long Lasting Fragrance", "Non-Sticky Lightweight Formula", and "Dermatologist Approved".
- **Product Collection Tabs:** Real-time filter between categories ("All", "Body Lotions & Milks", "Whipped Body Butters", "Exfoliating Scrubs", "Elixirs & Body Oils").
- **High-Converting Product Cards:** Aspect-ratio imagery with hover image flip, floating badges ("BESTSELLER", "HOT", "NEW", "-17%"), ratings, wishlist toggle, quick view modal, and quick add-to-bag.
- **Formulation Spotlight:** 2-column image with text detailing "The Power of Vanilla & Vitamin E" and numbered benefits.
- **Social Proof / Customer Reviews:** Testimonials with 5-star ratings, quotes, names, and verified buyer badges.
- **Slide-Over Cart Drawer:**
  - Free shipping progress threshold bar ("Add ₹X more to get Free Shipping!")
  - Cart item rows with quantity controls and delete
  - Coupon code input with instant validation and discount deduction (e.g., `WELCOME10`, `GLOW20`, `BOTANICA50`)
  - Subtotal, shipping, discount, and estimated total in ₹ (INR)
  - Direct "Proceed to Checkout" button
- **Product Detail Page (`/product/:slug`):**
  - Multi-image thumbnail gallery
  - Variant selector (e.g., 200ml, 400ml Jumbo)
  - Quantity counter + "Add to Cart" + "Buy Now"
  - Sticky bottom Add-to-Cart bar on scroll
  - Collapsible accordion drawers (Description, Ingredients, How to Use, Shipping & Returns)
  - Customer review submission form and verified review list
  - Related product recommendations
- **Multi-Step Checkout Flow (`/checkout`):**
  - Contact details, shipping address with pincode validation
  - Standard Delivery (Free above ₹450 / ₹50) & Express Courier (₹100)
  - Cash on Delivery (COD) and Instant Secure Online Payment (UPI / Cards / NetBanking)
  - Confetti celebration upon completion
- **Order Success & Tracking (`/order-success/:orderNumber` and `/track-order`):**
  - Unique order tracking ID, fulfillment timeline, and printable invoice receipt.

---

### 2. Complete Admin Dashboard (`/admin`)
- **📊 KPI Dashboard:** Live Gross Sales, Order Count, Active Products, and Low Stock Alerts.
- **📦 Products Management:** Full CRUD operations, variant management, SKU tracking, prices, and inline stock restock (+10 units).
- **📁 Categories Management:** Full CRUD for catalog collections.
- **📋 Orders Management:** Filter by status (Pending, Processing, Shipped, Delivered, Cancelled), tracking AWB assignment, courier partner selection, and payment status updates.
- **👥 Customer Directory:** Customer spending totals, order history, phone numbers, and addresses.
- **🏷️ Coupons & Discounts:** Create percentage or flat cash coupons with min-spend rules, expiry dates, and usage limits.
- **⭐ Reviews Moderation:** Approve, reject, or delete customer reviews.
- **🖼️ Banners & Sliders:** Manage homepage hero slides, subtitles, and button links.
- **📝 Botanical Journal (Blog):** Publish skincare articles and guides.
- **❓ FAQs Management:** Add, edit, and categorize help center answers.
- **⚙️ Storefront Settings:** Customize brand name, tagline, announcement bar, shipping rules, tax percentage, support email, helpline, and legal policies.

---

## 🔑 Default Credentials

### Store Administrator
- **URL:** `/admin/login`
- **Email:** `admin@aurabotanica.com`
- **Password:** `admin123456`

### Demo Customer
- **URL:** `/account?tab=login`
- **Email:** `customer@aurabotanica.com`
- **Password:** `customer123456`

### Promotional Coupons
- `WELCOME10`: 10% off (no min order)
- `GLOW20`: 20% off on orders above ₹799
- `BOTANICA50`: Flat ₹50 off on orders above ₹450

---

## 🚀 Running the Project (Next.js)

### 1. Start Development Server (Next.js Turbopack)
```bash
npm run dev
```
Runs at: **`http://localhost:3000`**

### 2. Build for Production
```bash
npm run build
```

### 3. Start Production Server
```bash
npm start
```
Runs at: **`http://localhost:3000`**

### 4. Run Fullstack Production Verification Suite
```bash
npm run verify
```

### 5. Re-seed Supabase Database
```bash
npm run seed
```

