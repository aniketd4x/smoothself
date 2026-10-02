const { getSupabase, isSupabaseConnected } = require('../config/supabase');
const localStore = require('../data/localStore');

// --- Normalizers to ensure 100% frontend compatibility with both _id and id ---

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
    isActive: cp.is_active !== undefined ? Boolean(cp.is_active) : (cp.isActive !== undefined ? Boolean(cp.isActive) : true)
  };
}

function normalizeOrder(o) {
  if (!o) return null;
  return {
    ...o,
    _id: o.id || o._id,
    id: o.id || o._id,
    orderNumber: o.order_number || o.orderNumber,
    customerDetails: o.customer_details || o.customerDetails,
    shippingAddress: o.shipping_address || o.shippingAddress,
    orderItems: o.order_items || o.orderItems || [],
    totalAmount: o.total_amount != null ? Number(o.total_amount) : (o.totalAmount || 0),
    subtotal: o.subtotal != null ? Number(o.subtotal) : (o.subtotal || 0),
    shippingFee: o.shipping_fee != null ? Number(o.shipping_fee) : (o.shippingFee || 0),
    paymentMethod: o.payment_method || o.paymentMethod || 'COD',
    paymentStatus: o.payment_status || o.paymentStatus || 'Pending',
    orderStatus: o.order_status || o.orderStatus || 'Processing',
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
    isApproved: r.is_approved !== undefined ? Boolean(r.is_approved) : (r.isApproved !== undefined ? Boolean(r.isApproved) : true),
    isVerifiedPurchase: r.is_verified_buyer !== undefined ? Boolean(r.is_verified_buyer) : (r.isVerifiedPurchase !== undefined ? Boolean(r.isVerifiedPurchase) : true)
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
    currencySymbol: s.currency_symbol || s.currencySymbol || '₹'
  };
}

// --- PRODUCTS CRUD ---

async function getProducts(options = {}) {
  const sb = getSupabase();
  if (isSupabaseConnected() && sb) {
    try {
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
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(normalizeProduct);
      }
    } catch (e) {
      console.warn('[Supabase getProducts error]', e.message);
    }
  }
  return (localStore.getProducts(options) || []).map(normalizeProduct);
}

async function getProductByIdOrSlug(idOrSlug) {
  const sb = getSupabase();
  if (isSupabaseConnected() && sb) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      let query = sb.from('products').select('*');
      if (isUuid) {
        query = query.eq('id', idOrSlug);
      } else {
        query = query.eq('slug', idOrSlug);
      }
      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        return normalizeProduct(data);
      }
    } catch (e) {
      console.warn('[Supabase getProductByIdOrSlug error]', e.message);
    }
  }
  const local = localStore.getProductByIdOrSlug(idOrSlug);
  return normalizeProduct(local);
}

async function createProduct(payload) {
  const slug = payload.slug || (payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4));
  const sb = getSupabase();

  let categoryName = payload.categoryName || '';
  if (isSupabaseConnected() && sb && payload.category) {
    try {
      const { data: cat } = await sb.from('categories').select('name').eq('id', payload.category).maybeSingle();
      if (cat) categoryName = cat.name;
    } catch (e) {}
  }

  const supabaseData = {
    name: payload.name,
    slug,
    category_id: payload.category || null,
    category_name: categoryName,
    short_description: payload.shortDescription || '',
    description: payload.description || '',
    ingredients: payload.ingredients || '',
    how_to_use: payload.howToUse || '',
    benefits: payload.benefits || [],
    price: Number(payload.price) || 0,
    compare_at_price: Number(payload.compareAtPrice) || 0,
    cost_price: Number(payload.costPrice) || 0,
    sku: payload.sku || `SKU-${Date.now().toString().slice(-6)}`,
    stock: Number(payload.stock) || 0,
    low_stock_threshold: Number(payload.lowStockThreshold) || 10,
    images: payload.images || ['/logo.webp'],
    variants: payload.variants || [],
    badges: payload.badges || [],
    is_featured: Boolean(payload.isFeatured),
    is_active: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
    tags: payload.tags || [],
    weight: payload.weight || '200ml',
    seo_title: payload.seoTitle || payload.name,
    seo_description: payload.seoDescription || payload.shortDescription || ''
  };

  let created = null;
  if (isSupabaseConnected() && sb) {
    try {
      const { data, error } = await sb.from('products').insert(supabaseData).select().single();
      if (!error && data) {
        created = normalizeProduct(data);
      } else if (error) {
        console.warn('[Supabase createProduct warning]', error.message);
      }
    } catch (e) {
      console.warn('[Supabase createProduct exception]', e.message);
    }
  }

  const newLocal = {
    _id: created?.id || ('prod-' + Date.now()),
    ...supabaseData,
    category: supabaseData.category_id,
    categoryName: supabaseData.category_name,
    isActive: supabaseData.is_active,
    isFeatured: supabaseData.is_featured,
    shortDescription: supabaseData.short_description,
    createdAt: new Date().toISOString()
  };
  localStore.data.products.push(newLocal);
  localStore.saveData();

  return created || normalizeProduct(newLocal);
}

async function updateProduct(id, updates) {
  const sb = getSupabase();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const supabaseUpdates = {};
  if (updates.name !== undefined) supabaseUpdates.name = updates.name;
  if (updates.price !== undefined) supabaseUpdates.price = Number(updates.price);
  if (updates.compareAtPrice !== undefined) supabaseUpdates.compare_at_price = Number(updates.compareAtPrice);
  if (updates.costPrice !== undefined) supabaseUpdates.cost_price = Number(updates.costPrice);
  if (updates.stock !== undefined) supabaseUpdates.stock = Number(updates.stock);
  if (updates.lowStockThreshold !== undefined) supabaseUpdates.low_stock_threshold = Number(updates.lowStockThreshold);
  if (updates.category !== undefined) supabaseUpdates.category_id = updates.category;
  if (updates.categoryName !== undefined) supabaseUpdates.category_name = updates.categoryName;
  if (updates.description !== undefined) supabaseUpdates.description = updates.description;
  if (updates.shortDescription !== undefined) supabaseUpdates.short_description = updates.shortDescription;
  if (updates.ingredients !== undefined) supabaseUpdates.ingredients = updates.ingredients;
  if (updates.howToUse !== undefined) supabaseUpdates.how_to_use = updates.howToUse;
  if (updates.benefits !== undefined) supabaseUpdates.benefits = updates.benefits;
  if (updates.images !== undefined) supabaseUpdates.images = updates.images;
  if (updates.variants !== undefined) supabaseUpdates.variants = updates.variants;
  if (updates.badges !== undefined) supabaseUpdates.badges = updates.badges;
  if (updates.tags !== undefined) supabaseUpdates.tags = updates.tags;
  if (updates.weight !== undefined) supabaseUpdates.weight = updates.weight;
  if (updates.isActive !== undefined) supabaseUpdates.is_active = Boolean(updates.isActive);
  if (updates.isFeatured !== undefined) supabaseUpdates.is_featured = Boolean(updates.isFeatured);
  if (updates.sku !== undefined) supabaseUpdates.sku = updates.sku;

  let updated = null;
  if (isSupabaseConnected() && sb) {
    try {
      let query = sb.from('products').update(supabaseUpdates);
      if (isUuid) {
        query = query.eq('id', id);
      } else {
        query = query.or(`slug.eq.${id},sku.eq.${id}`);
      }
      const { data, error } = await query.select().maybeSingle();
      if (!error && data) {
        updated = normalizeProduct(data);
      }
    } catch (e) {
      console.warn('[Supabase updateProduct warning]', e.message);
    }
  }

  const local = localStore.getProductByIdOrSlug(id);
  if (local) {
    Object.assign(local, updates);
    localStore.saveData();
    if (!updated) updated = normalizeProduct(local);
  }

  return updated;
}

async function deleteProduct(id) {
  const sb = getSupabase();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (isSupabaseConnected() && sb) {
    try {
      let query = sb.from('products').delete();
      if (isUuid) {
        query = query.eq('id', id);
      } else {
        query = query.or(`slug.eq.${id},sku.eq.${id}`);
      }
      await query;
    } catch (e) {
      console.warn('[Supabase deleteProduct warning]', e.message);
    }
  }

  localStore.data.products = localStore.data.products.filter(p => 
    String(p._id) !== String(id) && 
    String(p.id) !== String(id) && 
    p.slug !== id && 
    p.sku !== id
  );
  localStore.saveData();
  return true;
}

// --- CATEGORIES CRUD ---

async function getCategories(all = false) {
  const sb = getSupabase();
  if (isSupabaseConnected() && sb) {
    try {
      let query = sb.from('categories').select('*').order('display_order', { ascending: true });
      if (!all) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(normalizeCategory);
      }
    } catch (e) {
      console.warn('[Supabase getCategories error]', e.message);
    }
  }
  const localCats = all ? localStore.data.categories : localStore.getCategories();
  return (localCats || []).map(normalizeCategory);
}

async function createCategory(payload) {
  const slug = payload.slug || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const sb = getSupabase();

  const supabaseData = {
    name: payload.name,
    slug,
    description: payload.description || '',
    image: payload.image || '',
    display_order: Number(payload.order) || 0,
    is_active: payload.isActive !== undefined ? Boolean(payload.isActive) : true
  };

  let created = null;
  if (isSupabaseConnected() && sb) {
    try {
      const { data, error } = await sb.from('categories').insert(supabaseData).select().single();
      if (!error && data) {
        created = normalizeCategory(data);
      }
    } catch (e) {}
  }

  const newLocal = {
    _id: created?.id || ('cat-' + Date.now()),
    ...supabaseData,
    order: supabaseData.display_order,
    isActive: supabaseData.is_active,
    createdAt: new Date().toISOString()
  };
  localStore.data.categories.push(newLocal);
  localStore.saveData();

  return created || normalizeCategory(newLocal);
}

async function updateCategory(id, updates) {
  const sb = getSupabase();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const supabaseUpdates = {};
  if (updates.name !== undefined) supabaseUpdates.name = updates.name;
  if (updates.description !== undefined) supabaseUpdates.description = updates.description;
  if (updates.image !== undefined) supabaseUpdates.image = updates.image;
  if (updates.order !== undefined) supabaseUpdates.display_order = Number(updates.order);
  if (updates.isActive !== undefined) supabaseUpdates.is_active = Boolean(updates.isActive);

  let updated = null;
  if (isSupabaseConnected() && sb) {
    try {
      let query = sb.from('categories').update(supabaseUpdates);
      if (isUuid) {
        query = query.eq('id', id);
      } else {
        query = query.eq('slug', id);
      }
      const { data, error } = await query.select().maybeSingle();
      if (!error && data) {
        updated = normalizeCategory(data);
      }
    } catch (e) {}
  }

  const local = localStore.data.categories.find(c => String(c._id) === id || String(c.id) === id || c.slug === id);
  if (local) {
    Object.assign(local, updates);
    localStore.saveData();
    if (!updated) updated = normalizeCategory(local);
  }

  return updated;
}

async function deleteCategory(id) {
  const sb = getSupabase();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (isSupabaseConnected() && sb) {
    try {
      let query = sb.from('categories').delete();
      if (isUuid) {
        query = query.eq('id', id);
      } else {
        query = query.eq('slug', id);
      }
      await query;
    } catch (e) {}
  }

  localStore.data.categories = localStore.data.categories.filter(c => 
    String(c._id) !== String(id) && 
    String(c.id) !== String(id) && 
    c.slug !== id
  );
  localStore.saveData();
  return true;
}

// --- COUPONS CRUD ---

async function getCoupons() {
  const sb = getSupabase();
  if (isSupabaseConnected() && sb) {
    try {
      const { data, error } = await sb.from('coupons').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(normalizeCoupon);
      }
    } catch (e) {}
  }
  return (localStore.data.coupons || []).map(normalizeCoupon);
}

async function createCoupon(payload) {
  const sb = getSupabase();
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

  let created = null;
  if (isSupabaseConnected() && sb) {
    try {
      const { data, error } = await sb.from('coupons').insert(supabaseData).select().single();
      if (!error && data) {
        created = normalizeCoupon(data);
      }
    } catch (e) {}
  }

  const newLocal = {
    _id: created?.id || ('coup-' + Date.now()),
    ...payload,
    code: payload.code.toUpperCase(),
    createdAt: new Date().toISOString()
  };
  localStore.data.coupons.push(newLocal);
  localStore.saveData();

  return created || normalizeCoupon(newLocal);
}

async function deleteCoupon(id) {
  const sb = getSupabase();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (isSupabaseConnected() && sb) {
    try {
      let query = sb.from('coupons').delete();
      if (isUuid) query = query.eq('id', id);
      else query = query.eq('code', id.toUpperCase());
      await query;
    } catch (e) {}
  }

  localStore.data.coupons = localStore.data.coupons.filter(c => 
    String(c._id) !== String(id) && 
    String(c.id) !== String(id) && 
    c.code !== id.toUpperCase()
  );
  localStore.saveData();
  return true;
}

// --- USERS & AUTH ---

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

async function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  const sb = getSupabase();
  if (isSupabaseConnected() && sb) {
    try {
      const { data, error } = await sb.from('users').select('*').ilike('email', cleanEmail).maybeSingle();
      if (!error && data) return normalizeUser(data);
    } catch (e) {}
  }
  const local = localStore.findUserByEmail(cleanEmail);
  return normalizeUser(local);
}

async function findUserById(id) {
  if (!id) return null;
  const sb = getSupabase();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isSupabaseConnected() && sb && isUuid) {
    try {
      const { data, error } = await sb.from('users').select('*').eq('id', id).maybeSingle();
      if (!error && data) return normalizeUser(data);
    } catch (e) {}
  }
  const local = localStore.findUserById(id);
  return normalizeUser(local);
}

async function updateUserCredentials(id, { name, email, phone, password }) {
  const bcrypt = require('bcryptjs');
  const sb = getSupabase();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const cleanEmail = email ? email.trim().toLowerCase() : undefined;

  // Check email uniqueness if email is changing
  if (cleanEmail) {
    const existing = await findUserByEmail(cleanEmail);
    if (existing && String(existing.id) !== String(id) && String(existing._id) !== String(id)) {
      throw new Error('This email address is already associated with another account.');
    }
  }

  const supabaseUpdates = {};
  if (name) supabaseUpdates.name = name.trim();
  if (cleanEmail) supabaseUpdates.email = cleanEmail;
  if (phone !== undefined) supabaseUpdates.phone = phone.trim();
  if (password && password.trim()) {
    const salt = bcrypt.genSaltSync(10);
    supabaseUpdates.password = bcrypt.hashSync(password.trim(), salt);
  }

  let updated = null;
  if (isSupabaseConnected() && sb) {
    try {
      let query = sb.from('users').update(supabaseUpdates);
      if (isUuid) {
        query = query.eq('id', id);
      } else {
        query = query.eq('email', cleanEmail || '');
      }
      const { data, error } = await query.select().maybeSingle();
      if (!error && data) {
        updated = normalizeUser(data);
      }
    } catch (e) {
      console.warn('[Supabase updateUserCredentials error]', e.message);
    }
  }

  const localUpdated = localStore.updateUser(id, {
    name,
    email: cleanEmail,
    phone,
    password: password && password.trim() ? password.trim() : undefined
  });

  if (localUpdated && !updated) {
    updated = normalizeUser(localUpdated);
  }

  return updated;
}

module.exports = {
  normalizeProduct,
  normalizeCategory,
  normalizeCoupon,
  normalizeOrder,
  normalizeReview,
  normalizeSetting,
  normalizeUser,
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCoupons,
  createCoupon,
  deleteCoupon,
  findUserByEmail,
  findUserById,
  updateUserCredentials
};
