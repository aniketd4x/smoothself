# Aura Botanica — Botanical Skincare E-Commerce Platform

A production-ready e-commerce platform crafted with the visual and UX structure inspired by [smoothself.in](https://smoothself.in/), tailored with a high-end brand identity (**Aura Botanica**), clean plant formulations, and a complete relational MongoDB-backed API architecture and Admin Panel.

---

## 🌟 Highlights & Architecture

### 1. Frontend & UX (Faithful Re-creation of Reference UX)
- **Top Announcement Bar:** Dismissible with promo highlight ("Free shipping on orders above ₹450").
- **Sticky Minimalist Header:** Brand logo, navigation menu, predictive search modal trigger, customer account dropdown, wishlist icon with count badge, and shopping bag trigger with real-time count & subtotal.
- **Hero Slideshow:** Auto-playing smooth slides with elegant typography, pill tags, and CTA buttons ("Shop Collection").
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


---

## ⚡ Supabase Keep-Alive Mechanism (Prevent Automatic Pausing)

### Background & Supabase Inactivity Policy
Supabase projects on the **Free Tier** automatically pause after **7 consecutive days of inactivity** (lack of user database queries or API traffic). When paused:
- Database connections stop accepting traffic.
- Frontend requests fail (e.g. 503 Service Unavailable).
- Projects can be manually resumed from the Supabase Dashboard for up to 1 year.
- **Paid Plans (Pro $25/mo, Team, Enterprise)** are never paused for inactivity.

### Keep-Alive Solution
This repository includes an automated keep-alive health-check mechanism designed to safely reset Supabase's 7-day inactivity timer without creating database writes or excessive traffic:

1. **Lightweight PostgREST Query**:
   Sends an authenticated `GET /rest/v1/categories?select=id&limit=1` request using the project's public anon key. PostgREST executes a `SELECT id FROM categories LIMIT 1` directly on PostgreSQL, which is registered as real user database query activity in Supabase platform telemetry.
2. **Scheduled Interval**:
   Runs every 5 days via GitHub Actions (`cron: '18 4 */5 * *'`), safely within the 7-day inactivity threshold.
3. **Randomized Delay (Jitter)**:
   Includes a 0-30s randomized jitter delay to avoid rigid execution timestamps.
4. **Resilience & Retries**:
   Includes 3 retry attempts with exponential backoff (5s, 10s, 20s) and a 15-second per-request timeout.
5. **Zero Write Footprint**:
   Purely read-only query fetching a single UUID (~50 bytes payload).
6. **Detailed CI Summary**:
   Automatically generates visual Markdown reports in the GitHub Actions Step Summary.

### Required GitHub Repository Secrets
To enable the scheduled GitHub Action on your repository (`https://github.com/aniketd4x/smoothself`):
1. Navigate to **Settings** > **Secrets and variables** > **Actions**.
2. Click **New repository secret** and add:
   - `SUPABASE_URL`: Your Supabase project URL (e.g., `https://<project-ref>.supabase.co`).
   - `SUPABASE_ANON_KEY`: Your Supabase anon / publishable key (found in Supabase Dashboard > Project Settings > API).

> ⚠️ **Security Note**: Never commit `service_role` keys or database passwords. The keep-alive mechanism only requires the read-only `anon` key.

### Local Testing & Manual Trigger
You can test the keep-alive health check locally at any time:
```bash
npm run keepalive
```

You can also trigger it manually from GitHub:
1. Go to the **Actions** tab in your GitHub repository.
2. Select **Supabase Keep-Alive Health-Check**.
3. Click **Run workflow**.

### Monitoring and Alerting
- **Execution History**: View real-time logs, response latency, and execution timestamps under the **Actions** tab.
- **Email Notifications**: If all 3 retry attempts fail, the workflow exits with code 1 and GitHub will automatically send an email alert to the repository owner.
- **Backend Health Check**: You can also query the live backend server at `/api/health/supabase` (or `/api/health?db=true`) to check database connectivity and latency.

### Important Limitations & Best Practices
- **GitHub Actions 60-Day Inactivity Rule**: In public repositories, GitHub automatically suspends scheduled workflows (`cron`) if the repository receives no commits or pull requests for 60 consecutive days. If your repository is idle, ensure you either re-enable the workflow when prompted by GitHub's email reminder, or set up an external pinger (e.g. UptimeRobot or cron-job.org) hitting `/api/health/supabase`.
- **Permanent Solution**: For mission-critical production applications requiring guaranteed 24/7 uptime without reliance on scheduled pings, upgrading to the **Supabase Pro Plan ($25/month)** is recommended. Pro projects are permanently kept active and never paused.
