-- ===================================================
-- SmoothSelf E-Commerce Supabase Database Schema
-- Run this in your Supabase Project > SQL Editor
-- ===================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password text,
  phone text,
  role text default 'customer',
  addresses jsonb default '[]'::jsonb,
  wishlist jsonb default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Categories Table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image text,
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Products Table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category_id uuid references public.categories(id) on delete set null,
  category_name text,
  short_description text,
  description text,
  ingredients text,
  how_to_use text,
  benefits jsonb default '[]'::jsonb,
  price numeric(10, 2) not null,
  compare_at_price numeric(10, 2) default 0,
  cost_price numeric(10, 2) default 0,
  sku text unique,
  stock integer default 0,
  low_stock_threshold integer default 10,
  images jsonb default '[]'::jsonb,
  variants jsonb default '[]'::jsonb,
  badges jsonb default '[]'::jsonb,
  rating numeric(3, 2) default 5.0,
  num_reviews integer default 0,
  is_featured boolean default false,
  is_active boolean default true,
  tags jsonb default '[]'::jsonb,
  weight text default '200ml',
  seo_title text,
  seo_description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Orders Table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_details jsonb not null,
  user_id uuid references public.users(id) on delete set null,
  shipping_address jsonb not null,
  order_items jsonb not null,
  subtotal numeric(10, 2) not null,
  shipping_fee numeric(10, 2) default 0,
  discount numeric(10, 2) default 0,
  coupon_applied jsonb,
  total_amount numeric(10, 2) not null,
  payment_method text default 'COD',
  payment_status text default 'Pending',
  order_status text default 'Processing',
  tracking_updates jsonb default '[]'::jsonb,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Coupons Table
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text default 'percentage',
  discount_value numeric(10, 2) not null,
  min_order_amount numeric(10, 2) default 0,
  max_discount_amount numeric(10, 2),
  start_date timestamp with time zone,
  expiry_date timestamp with time zone,
  usage_limit integer,
  usage_count integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Reviews Table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  user_name text not null,
  user_email text,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  comment text,
  is_verified_buyer boolean default true,
  is_approved boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Settings Table
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  brand_name text default 'SMOOTHSELF',
  logo_url text default '/logo.webp',
  tagline text default 'Naturally Silky Smooth',
  announcement_text text default 'Free shipping order above ₹ 450',
  announcement_active boolean default true,
  free_shipping_threshold numeric(10, 2) default 450,
  standard_shipping_fee numeric(10, 2) default 50,
  express_shipping_fee numeric(10, 2) default 100,
  contact_email text default 'support@smoothself.in',
  contact_phone text default '+91 99604 42750',
  contact_address text default 'Mumbai, Maharashtra',
  currency_symbol text default '₹',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Banners Table
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image text not null,
  mobile_image text,
  link text default '/shop',
  cta_text text default 'Shop Now',
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Blogs Table
create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  author text default 'SmoothSelf Botanical Lab',
  image text,
  read_time text default '4 min read',
  published boolean default true,
  tags jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. FAQs Table
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text default 'General',
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Subscribers Table
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

