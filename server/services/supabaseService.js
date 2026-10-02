const { getSupabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');

function getClient() {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('Supabase client is not connected. Please verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  }
  return sb;
}

// --- NORMALIZERS FOR DUAL _id / id FRONTEND COMPATIBILITY ---

function normalizeProduct(p) {
  if (!p) return null;
  return {
    ...p,
    _id: p.id || p._id,
    id: p.id || p._id,
    category: p.category_id || p.category,
    categoryName: p.category_name || p.categoryName || '',
    shortDescription: p.short_description || p.shortDescription || '',
    howToUse: p.how_to_use || p.howToUse || '',
    compareAtPrice: p.compare_at_price != null ? Number(p.compare_at_price) : (p.compareAtPrice || 0),
    costPrice: p.cost_price != null ? Number(p.cost_price) : (p.costPrice || 0),
    lowStockThreshold: p.low_stock_threshold != null ? Number(p.low_stock_threshold) : (p.lowStockThreshold || 10),
    numReviews: p.num_reviews != null ? Number(p.num_reviews) : (p.numReviews || 0),
    isFeatured: p.is_featured !== undefined ? Boolean(p.is_featured) : Boolean(p.isFeatured),
    isActive: p.is_active !== undefined ? Boolean(p.is_active) : (p.isActive !== undefined ? Boolean(p.isActive) : true),
    seoTitle: p.seo_title || p.seoTitle || p.name,
    seoDescription: p.seo_description || p.seoDescription || p.short_description || '',
    createdAt: p.created_at || p.createdAt || new Date().toISOString()
  };
}

function normalizeCategory(c) {
  if (!c) return null;
  return {
    ...c,
    _id: c.id || c._id,
    id: c.id || c._id,
    order: c.display_order != null ? Number(c.display_order) : (c.order || 0),
    display_order: c.display_order != null ? Number(c.display_order) : (c.order || 0),
    isActive: c.is_active !== undefined ? Boolean(c.is_active) : (c.isActive !== undefined ? Boolean(c.isActive) : true),
    createdAt: c.created_at || c.createdAt || new Date().toISOString()
  };
}

function normalizeCoupon(cp) {
  if (!cp) return null;
  return {
    ...cp,
    _id: cp.id || cp._id,
    id: cp.id || cp._id,
    discountType: cp.discount_type || cp.discountType || 'percentage',
    discountValue: cp.discount_value != null ? Number(cp.discount_value) : (cp.discountValue || 0),
    minOrderAmount: cp.min_order_amount != null ? Number(cp.min_order_amount) : (cp.minOrderAmount || 0),
    maxDiscountAmount: cp.max_discount_amount != null ? Number(cp.max_discount_amount) : (cp.maxDiscountAmount || 0),
    expiryDate: cp.expiry_date || cp.expiryDate,
    usageLimit: cp.usage_limit != null ? Number(cp.usage_limit) : (cp.usageLimit || 0),
    usageCount: cp.usage_count != null ? Number(cp.usage_count) : (cp.usageCount || 0),
    isActive: cp.is_active !== undefined ? Boolean(cp.is_active) : (cp.isActive !== undefined ? Boolean(cp.isActive) : true),
    createdAt: cp.created_at || cp.createdAt || new Date().toISOString()
  };
}

function normalizeOrder(o) {
  if (!o) return null;
  return {
    ...o,
    _id: o.id || o._id,
    id: o.id || o._id,
    user: o.user_id || o.user,
    orderNumber: o.order_number || o.orderNumber,
    customerDetails: o.customer_details || o.customerDetails,
    shippingAddress: o.shipping_address || o.shippingAddress,
    orderItems: o.order_items || o.orderItems || [],
    totalAmount: o.total_amount != null ? Number(o.total_amount) : (o.totalAmount || 0),
    subtotal: o.subtotal != null ? Number(o.subtotal) : (o.subtotal || 0),
    shippingFee: o.shipping_fee != null ? Number(o.shipping_fee) : (o.shippingFee || 0),
    shippingCost: o.shipping_fee != null ? Number(o.shipping_fee) : (o.shippingFee || 0),
    discount: o.discount != null ? Number(o.discount) : (o.discountAmount || 0),
    discountAmount: o.discount != null ? Number(o.discount) : (o.discountAmount || 0),
    couponApplied: o.coupon_applied || o.couponApplied || null,
    paymentMethod: o.payment_method || o.paymentMethod || 'COD',
    paymentStatus: o.payment_status || o.paymentStatus || 'Pending',
    orderStatus: o.order_status || o.orderStatus || 'Processing',
    trackingUpdates: o.tracking_updates || o.trackingUpdates || [],
    notes: o.notes || o.customerNotes || '',
    customerNotes: o.notes || o.customerNotes || '',
    createdAt: o.created_at || o.createdAt || new Date().toISOString(),
    placedAt: o.created_at || o.placedAt || new Date().toISOString()
  };
}

function normalizeReview(r) {
  if (!r) return null;
  return {
    ...r,
    _id: r.id || r._id,
    id: r.id || r._id,
    product: r.product_id || r.product,
    productId: r.product_id || r.productId,
    userName: r.user_name || r.userName,
    userEmail: r.user_email || r.userEmail || '',
    rating: Number(r.rating) || 5,
    title: r.title || '',
    comment: r.comment || '',
    isApproved: r.is_approved !== undefined ? Boolean(r.is_approved) : (r.isApproved !== undefined ? Boolean(r.isApproved) : true),
    isVerifiedPurchase: r.is_verified_buyer !== undefined ? Boolean(r.is_verified_buyer) : (r.isVerifiedPurchase !== undefined ? Boolean(r.isVerifiedPurchase) : true),
    createdAt: r.created_at || r.createdAt || new Date().toISOString()
  };
}

function normalizeSetting(s) {
  if (!s) return null;
  return {
    ...s,
    _id: s.id || s._id,
    id: s.id || s._id,
    brandName: s.brand_name || s.brandName || 'SMOOTHSELF',
    logoUrl: s.logo_url || s.logoUrl || '/logo.webp',
    tagline: s.tagline || '',
    announcementText: s.announcement_text || s.announcementText || '',
    announcementActive: s.announcement_active !== undefined ? Boolean(s.announcement_active) : (s.announcementActive !== undefined ? Boolean(s.announcementActive) : true),
    freeShippingThreshold: s.free_shipping_threshold != null ? Number(s.free_shipping_threshold) : (s.freeShippingThreshold || 450),
    standardShippingFee: s.standard_shipping_fee != null ? Number(s.standard_shipping_fee) : (s.standardShippingFee || 50),
    expressShippingFee: s.express_shipping_fee != null ? Number(s.express_shipping_fee) : (s.expressShippingFee || 100),
    contactEmail: s.contact_email || s.contactEmail || 'support@smoothself.in',
    contactPhone: s.contact_phone || s.contactPhone || '+91 99604 42750',
    contactAddress: s.contact_address || s.contactAddress || 'Mumbai, Maharashtra',
    currencySymbol: s.currency_symbol || s.currencySymbol || '₹',
    updatedAt: s.updated_at || s.updatedAt || new Date().toISOString()
  };
}

function normalizeUser(u) {
  if (!u) return null;
  return {
    ...u,
    _id: u.id || u._id,
    id: u.id || u._id,
    name: u.name,
    email: u.email,
    password: u.password,
    phone: u.phone || '',
    role: u.role || 'customer',
    addresses: u.addresses || [],
    wishlist: u.wishlist || [],
    isActive: u.is_active !== undefined ? Boolean(u.is_active) : (u.isActive !== undefined ? Boolean(u.isActive) : true),
    createdAt: u.created_at || u.createdAt || new Date().toISOString()
  };
}

function normalizeBanner(b) {
  if (!b) return null;
  return {
    ...b,
    _id: b.id || b._id,
    id: b.id || b._id,
    title: b.title,
    subtitle: b.subtitle || '',
    image: b.image,
    mobileImage: b.mobile_image || b.mobileImage || b.image,
    link: b.link || '/shop',
    ctaText: b.cta_text || b.ctaText || 'Shop Now',
    order: b.display_order != null ? Number(b.display_order) : (b.order || 0),
    isActive: b.is_active !== undefined ? Boolean(b.is_active) : (b.isActive !== undefined ? Boolean(b.isActive) : true),
    createdAt: b.created_at || b.createdAt || new Date().toISOString()
  };
}

function normalizeBlog(b) {
  if (!b) return null;
  return {
    ...b,
    _id: b.id || b._id,
    id: b.id || b._id,
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt || '',
    content: b.content || '',
    author: b.author || 'SmoothSelf Botanical Lab',
    image: b.image || '',
    readTime: b.read_time || b.readTime || '4 min read',
    published: b.published !== undefined ? Boolean(b.published) : true,
    tags: b.tags || [],
    createdAt: b.created_at || b.createdAt || new Date().toISOString()
  };
}

function normalizeFaq(f) {
  if (!f) return null;
  return {
    ...f,
    _id: f.id || f._id,
    id: f.id || f._id,
    question: f.question,
    answer: f.answer,
    category: f.category || 'General',
    order: f.display_order != null ? Number(f.display_order) : (f.order || 0),
    isActive: f.is_active !== undefined ? Boolean(f.is_active) : (f.isActive !== undefined ? Boolean(f.isActive) : true),
    createdAt: f.created_at || f.createdAt || new Date().toISOString()
  };
}

// --- PRODUCTS CRUD (SUPABASE EXCLUSIVE) ---

async function getProducts(options = {}) {
  const sb = getClient();
  let query = sb.from('products').select('*');

  if (options.isActive !== false) {
    query = query.eq('is_active', true);
  }
  if (options.category && options.category !== 'all') {
    query = query.or(`category_id.eq.${options.category},category_name.ilike.%${options.category}%`);
  }
  if (options.search) {
    query = query.or(`name.ilike.%${options.search}%,short_description.ilike.%${options.search}%,description.ilike.%${options.search}%`);
  }
  if (options.featured) {
    query = query.eq('is_featured', true);
  }
  if (options.sort === 'price-low') query = query.order('price', { ascending: true });
  else if (options.sort === 'price-high') query = query.order('price', { ascending: false });
  else if (options.sort === 'rating') query = query.order('rating', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []).map(normalizeProduct);
}

async function getProductByIdOrSlug(idOrSlug) {
  if (!idOrSlug) return null;
  const sb = getClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  let query = sb.from('products').select('*');
  if (isUuid) {
    query = query.eq('id', idOrSlug);
  } else {
    query = query.or(`slug.eq.${idOrSlug},sku.eq.${idOrSlug}`);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return normalizeProduct(data);
}

async function createProduct(productData) {
  const sb = getClient();
  const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productData.category);

  const supabaseRow = {
    name: productData.name,
    slug,
    category_id: isUuid ? productData.category : null,
    category_name: productData.categoryName || '',
    short_description: productData.shortDescription || '',
    description: productData.description || '',
    ingredients: productData.ingredients || '',
    how_to_use: productData.howToUse || '',
    benefits: Array.isArray(productData.benefits) ? productData.benefits : [],
    price: Number(productData.price) || 0,
    compare_at_price: Number(productData.compareAtPrice) || 0,
    cost_price: Number(productData.costPrice) || 0,
    sku: productData.sku || `SB-${Date.now().toString().slice(-6)}`,
    stock: Number(productData.stock) || 0,
    low_stock_threshold: Number(productData.lowStockThreshold) || 10,
    images: Array.isArray(productData.images) && productData.images.length > 0 ? productData.images : ['https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800'],
    variants: Array.isArray(productData.variants) ? productData.variants : [],
    badges: Array.isArray(productData.badges) ? productData.badges : [],
    rating: Number(productData.rating) || 5.0,
    num_reviews: Number(productData.numReviews) || 0,
    is_featured: Boolean(productData.isFeatured),
    is_active: productData.isActive !== undefined ? Boolean(productData.isActive) : true,
    tags: Array.isArray(productData.tags) ? productData.tags : [],
    weight: productData.weight || '200ml',
    seo_title: productData.seoTitle || productData.name,
    seo_description: productData.seoDescription || productData.shortDescription || ''
  };

  const { data, error } = await sb.from('products').insert([supabaseRow]).select().single();
  if (error) throw new Error(error.message);
  return normalizeProduct(data);
}

async function updateProduct(id, productData) {
  const sb = getClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const supabaseUpdates = {};
  if (productData.name !== undefined) supabaseUpdates.name = productData.name;
  if (productData.slug !== undefined) supabaseUpdates.slug = productData.slug;
  if (productData.category !== undefined) {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productData.category)) {
      supabaseUpdates.category_id = productData.category;
    }
  }
  if (productData.categoryName !== undefined) supabaseUpdates.category_name = productData.categoryName;
  if (productData.shortDescription !== undefined) supabaseUpdates.short_description = productData.shortDescription;
  if (productData.description !== undefined) supabaseUpdates.description = productData.description;
  if (productData.ingredients !== undefined) supabaseUpdates.ingredients = productData.ingredients;
  if (productData.howToUse !== undefined) supabaseUpdates.how_to_use = productData.howToUse;
  if (productData.benefits !== undefined) supabaseUpdates.benefits = productData.benefits;
  if (productData.price !== undefined) supabaseUpdates.price = Number(productData.price);
  if (productData.compareAtPrice !== undefined) supabaseUpdates.compare_at_price = Number(productData.compareAtPrice);
  if (productData.costPrice !== undefined) supabaseUpdates.cost_price = Number(productData.costPrice);
  if (productData.sku !== undefined) supabaseUpdates.sku = productData.sku;
  if (productData.stock !== undefined) supabaseUpdates.stock = Number(productData.stock);
  if (productData.lowStockThreshold !== undefined) supabaseUpdates.low_stock_threshold = Number(productData.lowStockThreshold);
  if (productData.images !== undefined) supabaseUpdates.images = productData.images;
  if (productData.variants !== undefined) supabaseUpdates.variants = productData.variants;
  if (productData.badges !== undefined) supabaseUpdates.badges = productData.badges;
  if (productData.rating !== undefined) supabaseUpdates.rating = Number(productData.rating);
  if (productData.numReviews !== undefined) supabaseUpdates.num_reviews = Number(productData.numReviews);
  if (productData.isFeatured !== undefined) supabaseUpdates.is_featured = Boolean(productData.isFeatured);
  if (productData.isActive !== undefined) supabaseUpdates.is_active = Boolean(productData.isActive);
  if (productData.tags !== undefined) supabaseUpdates.tags = productData.tags;
  if (productData.weight !== undefined) supabaseUpdates.weight = productData.weight;
  if (productData.seoTitle !== undefined) supabaseUpdates.seo_title = productData.seoTitle;
  if (productData.seoDescription !== undefined) supabaseUpdates.seo_description = productData.seoDescription;

  let query = sb.from('products').update(supabaseUpdates);
  if (isUuid) {
    query = query.eq('id', id);
  } else {
    query = query.or(`slug.eq.${id},sku.eq.${id}`);
  }

  const { data, error } = await query.select().maybeSingle();
  if (error) throw new Error(error.message);
  return normalizeProduct(data);
}

async function deleteProduct(id) {
  const sb = getClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let query = sb.from('products').delete();
  if (isUuid) {
    query = query.eq('id', id);
  } else {
    query = query.or(`slug.eq.${id},sku.eq.${id}`);
  }

  const { error } = await query;
  if (error) throw new Error(error.message);
  return true;
}

async function deductStock(productId, quantity = 1) {
  try {
    const prod = await getProductByIdOrSlug(productId);
    if (prod) {
      const newStock = Math.max(0, (prod.stock || 0) - Number(quantity));
      await updateProduct(prod.id, { stock: newStock });
    }
  } catch (err) {
    console.warn('[Deduct Stock Warning]', err.message);
  }
}

// --- CATEGORIES CRUD (SUPABASE EXCLUSIVE) ---

async function getCategories(all = false) {
  const sb = getClient();
  let query = sb.from('categories').select('*').order('display_order', { ascending: true });
  if (!all) {
    query = query.eq('is_active', true);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []).map(normalizeCategory);
}

async function createCategory(payload) {
  const sb = getClient();
  const slug = payload.slug || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const supabaseData = {
    name: payload.name,
    slug,
    description: payload.description || '',
    image: payload.image || '',
    display_order: Number(payload.order) || 0,
    is_active: payload.isActive !== undefined ? Boolean(payload.isActive) : true
  };

  const { data, error } = await sb.from('categories').insert([supabaseData]).select().single();
  if (error) throw new Error(error.message);
  return normalizeCategory(data);
}

async function updateCategory(id, updates) {
  const sb = getClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const supabaseUpdates = {};
  if (updates.name !== undefined) supabaseUpdates.name = updates.name;
  if (updates.description !== undefined) supabaseUpdates.description = updates.description;
  if (updates.image !== undefined) supabaseUpdates.image = updates.image;
  if (updates.order !== undefined) supabaseUpdates.display_order = Number(updates.order);
  if (updates.isActive !== undefined) supabaseUpdates.is_active = Boolean(updates.isActive);

  let query = sb.from('categories').update(supabaseUpdates);
  if (isUuid) {
    query = query.eq('id', id);
  } else {
    query = query.eq('slug', id);
  }

  const { data, error } = await query.select().maybeSingle();
  if (error) throw new Error(error.message);
  return normalizeCategory(data);
}

async function deleteCategory(id) {
  const sb = getClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let query = sb.from('categories').delete();
  if (isUuid) {
    query = query.eq('id', id);
  } else {
    query = query.eq('slug', id);
  }

  const { error } = await query;
  if (error) throw new Error(error.message);
  return true;
}

// --- COUPONS CRUD & VALIDATION (SUPABASE EXCLUSIVE) ---

async function getCoupons() {
  const sb = getClient();
  const { data, error } = await sb.from('coupons').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(normalizeCoupon);
}

async function createCoupon(payload) {
  const sb = getClient();
  const supabaseData = {
    code: payload.code.toUpperCase(),
    discount_type: payload.discountType || 'percentage',
    discount_value: Number(payload.discountValue) || 0,
    min_order_amount: Number(payload.minOrderAmount) || 0,
    max_discount_amount: Number(payload.maxDiscountAmount) || null,
    expiry_date: payload.expiryDate || new Date('2028-12-31').toISOString(),
    usage_limit: Number(payload.usageLimit) || 1000,
    is_active: payload.isActive !== undefined ? Boolean(payload.isActive) : true
  };

  const { data, error } = await sb.from('coupons').insert([supabaseData]).select().single();
  if (error) throw new Error(error.message);
  return normalizeCoupon(data);
}

async function deleteCoupon(id) {
  const sb = getClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let query = sb.from('coupons').delete();
  if (isUuid) query = query.eq('id', id);
  else query = query.eq('code', id.toUpperCase());

  const { error } = await query;
  if (error) throw new Error(error.message);
  return true;
}

async function validateCoupon(code, orderAmount) {
  if (!code) return { valid: false, message: 'Please provide a coupon code' };
  const cleanCode = code.trim().toUpperCase();
  const amount = Number(orderAmount) || 0;

  const coupons = await getCoupons();
  const coupon = coupons.find(c => c.code === cleanCode && c.isActive);

  if (!coupon) {
    return { valid: false, message: 'Invalid or inactive coupon code' };
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    return { valid: false, message: 'Coupon code has expired' };
  }

  if (amount < (coupon.minOrderAmount || 0)) {
    return { valid: false, message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon` };
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (amount * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    discount = coupon.discountValue;
  }
  if (discount > amount) discount = amount;

  return {
    valid: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.round(discount),
      description: coupon.description
    }
  };
}

async function incrementCouponUsage(code) {
  if (!code) return;
  try {
    const sb = getClient();
    const cleanCode = code.trim().toUpperCase();
    const { data: coupon } = await sb.from('coupons').select('id, usage_count').eq('code', cleanCode).maybeSingle();
    if (coupon) {
      await sb.from('coupons').update({ usage_count: (coupon.usage_count || 0) + 1 }).eq('id', coupon.id);
    }
  } catch (err) {
    console.warn('[Coupon Increment Warning]', err.message);
  }
}

// --- ORDERS CRUD (SUPABASE EXCLUSIVE) ---

async function createOrder(orderPayload) {
  const sb = getClient();
  const supabaseOrder = {
    order_number: orderPayload.orderNumber,
    customer_details: orderPayload.customerDetails,
    user_id: orderPayload.user || null,
    shipping_address: orderPayload.shippingAddress,
    order_items: orderPayload.orderItems,
    subtotal: Number(orderPayload.subtotal) || 0,
    shipping_fee: Number(orderPayload.shippingCost || orderPayload.shippingFee || 0),
    discount: Number(orderPayload.discountAmount || orderPayload.discount || 0),
    coupon_applied: orderPayload.couponCode ? { code: orderPayload.couponCode, amount: orderPayload.discountAmount } : null,
    total_amount: Number(orderPayload.totalAmount) || 0,
    payment_method: orderPayload.paymentMethod || 'COD',
    payment_status: orderPayload.paymentStatus || 'Pending',
    order_status: orderPayload.orderStatus || 'Processing',
    tracking_updates: [
      {
        status: orderPayload.orderStatus || 'Processing',
        message: 'Order placed and confirmed',
        timestamp: new Date().toISOString()
      }
    ],
    notes: orderPayload.customerNotes || orderPayload.notes || ''
  };

  const { data, error } = await sb.from('orders').insert([supabaseOrder]).select().single();
  if (error) throw new Error(error.message);
  return normalizeOrder(data);
}

async function getMyOrders(userId, email) {
  const sb = getClient();
  let query = sb.from('orders').select('*');

  if (userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    query = query.eq('user_id', userId);
  } else if (email) {
    query = query.ilike('customer_details->>email', email.trim().toLowerCase());
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(normalizeOrder);
}

async function getOrderByNumber(orderNumber) {
  if (!orderNumber) return null;
  const sb = getClient();
  const { data, error } = await sb.from('orders').select('*').eq('order_number', orderNumber.trim()).maybeSingle();
  if (error) throw new Error(error.message);
  return normalizeOrder(data);
}

async function getAllOrders(filters = {}) {
  const sb = getClient();
  let query = sb.from('orders').select('*');

  if (filters.status && filters.status !== 'all') {
    query = query.eq('order_status', filters.status);
  }
  if (filters.paymentStatus && filters.paymentStatus !== 'all') {
    query = query.eq('payment_status', filters.paymentStatus);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  let orders = (data || []).map(normalizeOrder);
  if (filters.search) {
    const s = filters.search.toLowerCase();
    orders = orders.filter(o => 
      o.orderNumber?.toLowerCase().includes(s) ||
      o.customerDetails?.name?.toLowerCase().includes(s) ||
      o.customerDetails?.email?.toLowerCase().includes(s) ||
      o.customerDetails?.phone?.includes(s)
    );
  }
  return orders;
}

async function updateOrderStatus(id, { orderStatus, paymentStatus, courier, trackingNumber, note }) {
  const sb = getClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let query = sb.from('orders').select('*');
  if (isUuid) query = query.eq('id', id);
  else query = query.eq('order_number', id);

  const { data: currentOrder, error: findErr } = await query.maybeSingle();
  if (findErr || !currentOrder) throw new Error('Order not found');

  const updates = {};
  if (orderStatus) updates.order_status = orderStatus;
  if (paymentStatus) updates.payment_status = paymentStatus;

  const trackingUpdates = currentOrder.tracking_updates || [];
  if (orderStatus) {
    trackingUpdates.push({
      status: orderStatus,
      message: note || `Order marked as ${orderStatus}`,
      courier: courier || 'Bluedart Express',
      trackingNumber: trackingNumber || '',
      timestamp: new Date().toISOString()
    });
    updates.tracking_updates = trackingUpdates;
  }

  const { data: updated, error: updErr } = await sb.from('orders').update(updates).eq('id', currentOrder.id).select().single();
  if (updErr) throw new Error(updErr.message);
  return normalizeOrder(updated);
}

// --- REVIEWS CRUD (SUPABASE EXCLUSIVE) ---

async function getProductReviews(productId) {
  const sb = getClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
  let query = sb.from('reviews').select('*').eq('is_approved', true);

  if (isUuid) {
    query = query.eq('product_id', productId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(normalizeReview);
}

async function createReview(reviewData) {
  const sb = getClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reviewData.productId);

  const supabaseRow = {
    product_id: isUuid ? reviewData.productId : null,
    user_name: reviewData.userName,
    user_email: reviewData.userEmail || '',
    rating: Number(reviewData.rating) || 5,
    title: reviewData.title || '',
    comment: reviewData.comment,
    is_verified_buyer: true,
    is_approved: true
  };

  const { data, error } = await sb.from('reviews').insert([supabaseRow]).select().single();
  if (error) throw new Error(error.message);
  return normalizeReview(data);
}

async function getAllReviews() {
  const sb = getClient();
  const { data, error } = await sb.from('reviews').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(normalizeReview);
}

async function approveReview(id) {
  const sb = getClient();
  const { data, error } = await sb.from('reviews').update({ is_approved: true }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return normalizeReview(data);
}

async function deleteReview(id) {
  const sb = getClient();
  const { error } = await sb.from('reviews').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

// --- SETTINGS & SUBSCRIBERS (SUPABASE EXCLUSIVE) ---

async function getSettings() {
  const sb = getClient();
  const { data, error } = await sb.from('settings').select('*').limit(1).maybeSingle();
  if (error) throw new Error(error.message);
  return normalizeSetting(data);
}

async function updateSettings(settingsData) {
  const sb = getClient();
  const current = await getSettings();

  const supabaseUpdates = {
    updated_at: new Date().toISOString()
  };
  if (settingsData.brandName !== undefined) supabaseUpdates.brand_name = settingsData.brandName;
  if (settingsData.logoUrl !== undefined) supabaseUpdates.logo_url = settingsData.logoUrl;
  if (settingsData.tagline !== undefined) supabaseUpdates.tagline = settingsData.tagline;
  if (settingsData.announcementText !== undefined) supabaseUpdates.announcement_text = settingsData.announcementText;
  if (settingsData.announcementActive !== undefined) supabaseUpdates.announcement_active = Boolean(settingsData.announcementActive);
  if (settingsData.freeShippingThreshold !== undefined) supabaseUpdates.free_shipping_threshold = Number(settingsData.freeShippingThreshold);
  if (settingsData.standardShippingFee !== undefined) supabaseUpdates.standard_shipping_fee = Number(settingsData.standardShippingFee);
  if (settingsData.expressShippingFee !== undefined) supabaseUpdates.express_shipping_fee = Number(settingsData.expressShippingFee);
  if (settingsData.contactEmail !== undefined) supabaseUpdates.contact_email = settingsData.contactEmail;
  if (settingsData.contactPhone !== undefined) supabaseUpdates.contact_phone = settingsData.contactPhone;
  if (settingsData.contactAddress !== undefined) supabaseUpdates.contact_address = settingsData.contactAddress;
  if (settingsData.currencySymbol !== undefined) supabaseUpdates.currency_symbol = settingsData.currencySymbol;

  let result = null;
  if (current && current.id) {
    const { data, error } = await sb.from('settings').update(supabaseUpdates).eq('id', current.id).select().single();
    if (error) throw new Error(error.message);
    result = data;
  } else {
    const { data, error } = await sb.from('settings').insert([supabaseUpdates]).select().single();
    if (error) throw new Error(error.message);
    result = data;
  }
  return normalizeSetting(result);
}

async function addSubscriber(email) {
  if (!email) return false;
  const sb = getClient();
  const cleanEmail = email.trim().toLowerCase();
  try {
    await sb.from('subscribers').upsert({ email: cleanEmail }, { onConflict: 'email' });
  } catch (err) {
    console.warn('[Subscriber Supabase Notice]', err.message);
  }
  return true;
}

// --- USERS & CREDENTIALS (SUPABASE EXCLUSIVE) ---

async function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  const sb = getClient();
  const { data, error } = await sb.from('users').select('*').ilike('email', cleanEmail).maybeSingle();
  if (error) throw new Error(error.message);
  return normalizeUser(data);
}

async function findUserById(id) {
  if (!id) return null;
  const sb = getClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isUuid) return null;

  const { data, error } = await sb.from('users').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return normalizeUser(data);
}

async function createUser(userData) {
  const sb = getClient();
  const cleanEmail = userData.email.trim().toLowerCase();

  const existing = await findUserByEmail(cleanEmail);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(userData.password, salt);

  const supabaseUser = {
    name: userData.name.trim(),
    email: cleanEmail,
    password: hashedPassword,
    phone: userData.phone ? userData.phone.trim() : '',
    role: userData.role || 'customer',
    addresses: userData.addresses || [],
    wishlist: userData.wishlist || [],
    is_active: true
  };

  const { data, error } = await sb.from('users').insert([supabaseUser]).select().single();
  if (error) throw new Error(error.message);
  return normalizeUser(data);
}

async function updateUserCredentials(id, { name, email, phone, password, addresses, wishlist }) {
  const sb = getClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const cleanEmail = email ? email.trim().toLowerCase() : undefined;

  // Uniqueness check across Supabase
  if (cleanEmail) {
    const existing = await findUserByEmail(cleanEmail);
    if (existing && String(existing.id) !== String(id)) {
      throw new Error('This email address is already associated with another account.');
    }
  }

  const supabaseUpdates = {};
  if (name) supabaseUpdates.name = name.trim();
  if (cleanEmail) supabaseUpdates.email = cleanEmail;
  if (phone !== undefined) supabaseUpdates.phone = phone ? phone.trim() : '';
  if (addresses !== undefined) supabaseUpdates.addresses = addresses;
  if (wishlist !== undefined) supabaseUpdates.wishlist = wishlist;
  if (password && password.trim()) {
    const salt = bcrypt.genSaltSync(10);
    supabaseUpdates.password = bcrypt.hashSync(password.trim(), salt);
  }

  let query = sb.from('users').update(supabaseUpdates);
  if (isUuid) {
    query = query.eq('id', id);
  } else {
    query = query.eq('email', cleanEmail || '');
  }

  const { data, error } = await query.select().maybeSingle();
  if (error) throw new Error(error.message);
  return normalizeUser(data);
}

async function updateUserAddresses(id, addresses) {
  const sb = getClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isUuid) throw new Error('Invalid user ID');

  const { data, error } = await sb.from('users').update({ addresses }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return normalizeUser(data);
}

// --- BANNERS, BLOGS, FAQS (SUPABASE EXCLUSIVE) ---

async function getBanners(all = false) {
  const sb = getClient();
  try {
    let query = sb.from('banners').select('*').order('display_order', { ascending: true });
    if (!all) query = query.eq('is_active', true);
    const { data, error } = await query;
    if (error) return [];
    return (data || []).map(normalizeBanner);
  } catch {
    return [];
  }
}

async function createBanner(payload) {
  const sb = getClient();
  const { data, error } = await sb.from('banners').insert([{
    title: payload.title,
    subtitle: payload.subtitle || '',
    image: payload.image,
    mobile_image: payload.mobileImage || payload.image,
    link: payload.link || '/shop',
    cta_text: payload.ctaText || 'Shop Now',
    display_order: Number(payload.order) || 0,
    is_active: payload.isActive !== undefined ? Boolean(payload.isActive) : true
  }]).select().single();
  if (error) throw new Error(error.message);
  return normalizeBanner(data);
}

async function updateBanner(id, payload) {
  const sb = getClient();
  const updates = {};
  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.subtitle !== undefined) updates.subtitle = payload.subtitle;
  if (payload.image !== undefined) updates.image = payload.image;
  if (payload.mobileImage !== undefined) updates.mobile_image = payload.mobileImage;
  if (payload.link !== undefined) updates.link = payload.link;
  if (payload.ctaText !== undefined) updates.cta_text = payload.ctaText;
  if (payload.order !== undefined) updates.display_order = Number(payload.order);
  if (payload.isActive !== undefined) updates.is_active = Boolean(payload.isActive);

  const { data, error } = await sb.from('banners').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return normalizeBanner(data);
}

async function deleteBanner(id) {
  const sb = getClient();
  const { error } = await sb.from('banners').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

async function getBlogs(all = false) {
  const sb = getClient();
  try {
    let query = sb.from('blogs').select('*').order('created_at', { ascending: false });
    if (!all) query = query.eq('published', true);
    const { data, error } = await query;
    if (error) return [];
    return (data || []).map(normalizeBlog);
  } catch {
    return [];
  }
}

async function getBlogBySlug(slug) {
  const sb = getClient();
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    let query = sb.from('blogs').select('*');
    if (isUuid) query = query.eq('id', slug);
    else query = query.eq('slug', slug);
    const { data, error } = await query.maybeSingle();
    if (error) return null;
    return normalizeBlog(data);
  } catch {
    return null;
  }
}

async function createBlog(payload) {
  const sb = getClient();
  const slug = payload.slug || payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const { data, error } = await sb.from('blogs').insert([{
    title: payload.title,
    slug,
    excerpt: payload.excerpt || '',
    content: payload.content || '',
    author: payload.author || 'SmoothSelf Botanical Lab',
    image: payload.image || '',
    read_time: payload.readTime || '4 min read',
    published: payload.published !== undefined ? Boolean(payload.published) : true,
    tags: Array.isArray(payload.tags) ? payload.tags : []
  }]).select().single();
  if (error) throw new Error(error.message);
  return normalizeBlog(data);
}

async function updateBlog(id, payload) {
  const sb = getClient();
  const updates = {};
  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.slug !== undefined) updates.slug = payload.slug;
  if (payload.excerpt !== undefined) updates.excerpt = payload.excerpt;
  if (payload.content !== undefined) updates.content = payload.content;
  if (payload.author !== undefined) updates.author = payload.author;
  if (payload.image !== undefined) updates.image = payload.image;
  if (payload.readTime !== undefined) updates.read_time = payload.readTime;
  if (payload.published !== undefined) updates.published = Boolean(payload.published);
  if (payload.tags !== undefined) updates.tags = payload.tags;

  const { data, error } = await sb.from('blogs').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return normalizeBlog(data);
}

async function deleteBlog(id) {
  const sb = getClient();
  const { error } = await sb.from('blogs').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

async function getFaqs(all = false) {
  const sb = getClient();
  try {
    let query = sb.from('faqs').select('*').order('display_order', { ascending: true });
    if (!all) query = query.eq('is_active', true);
    const { data, error } = await query;
    if (error) return [];
    return (data || []).map(normalizeFaq);
  } catch {
    return [];
  }
}

async function createFaq(payload) {
  const sb = getClient();
  const { data, error } = await sb.from('faqs').insert([{
    question: payload.question,
    answer: payload.answer,
    category: payload.category || 'General',
    display_order: Number(payload.order) || 0,
    is_active: payload.isActive !== undefined ? Boolean(payload.isActive) : true
  }]).select().single();
  if (error) throw new Error(error.message);
  return normalizeFaq(data);
}

async function updateFaq(id, payload) {
  const sb = getClient();
  const updates = {};
  if (payload.question !== undefined) updates.question = payload.question;
  if (payload.answer !== undefined) updates.answer = payload.answer;
  if (payload.category !== undefined) updates.category = payload.category;
  if (payload.order !== undefined) updates.display_order = Number(payload.order);
  if (payload.isActive !== undefined) updates.is_active = Boolean(payload.isActive);

  const { data, error } = await sb.from('faqs').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return normalizeFaq(data);
}

async function deleteFaq(id) {
  const sb = getClient();
  const { error } = await sb.from('faqs').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

module.exports = {
  normalizeProduct,
  normalizeCategory,
  normalizeCoupon,
  normalizeOrder,
  normalizeReview,
  normalizeSetting,
  normalizeUser,
  normalizeBanner,
  normalizeBlog,
  normalizeFaq,
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
  deductStock,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCoupons,
  createCoupon,
  deleteCoupon,
  validateCoupon,
  incrementCouponUsage,
  createOrder,
  getMyOrders,
  getOrderByNumber,
  getAllOrders,
  updateOrderStatus,
  getProductReviews,
  createReview,
  getAllReviews,
  approveReview,
  deleteReview,
  getSettings,
  updateSettings,
  addSubscriber,
  findUserByEmail,
  findUserById,
  createUser,
  updateUserCredentials,
  updateUserAddresses,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq
};
