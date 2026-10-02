const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const localStore = require('../data/localStore');
const { protect, adminOnly } = require('../middleware/auth');
const { isDBConnected } = require('../config/db');

// Get all active products with optional query filtering
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, featured, minPrice, maxPrice, badge } = req.query;
    let products = [];

    if (isDBConnected()) {
      try {
        let query = { isActive: true };

        if (category && category !== 'all') {
          const cat = await Category.findOne({ slug: category });
          if (cat) {
            query.category = cat._id;
          } else {
            query.categoryName = new RegExp(category, 'i');
          }
        }

        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { shortDescription: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
          ];
        }

        if (featured === 'true') query.isFeatured = true;
        if (badge) query.badges = badge;

        if (minPrice || maxPrice) {
          query.price = {};
          if (minPrice) query.price.$gte = Number(minPrice);
          if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        let sortOptions = { createdAt: -1 };
        if (sort === 'price-low') sortOptions = { price: 1 };
        else if (sort === 'price-high') sortOptions = { price: -1 };
        else if (sort === 'rating') sortOptions = { rating: -1 };
        else if (sort === 'popular') sortOptions = { numReviews: -1 };
        else if (sort === 'title-asc') sortOptions = { name: 1 };

        products = await Product.find(query).populate('category', 'name slug').sort(sortOptions);
      } catch (dbErr) {
        console.warn('[Product DB Warning]', dbErr.message);
      }
    }

    if (!products || products.length === 0) {
      products = localStore.getProducts({
        category,
        search,
        sort,
        featured: featured === 'true'
      });
    }

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all products (including inactive)
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    let products = [];
    if (isDBConnected()) {
      try {
        products = await Product.find().populate('category', 'name slug').sort({ createdAt: -1 });
      } catch (e) {}
    }
    if (!products || products.length === 0) {
      products = localStore.getProducts({ isActive: false });
    }
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single product by slug or ID
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let product = null;

    if (isDBConnected()) {
      try {
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
          product = await Product.findById(identifier).populate('category');
        } else {
          product = await Product.findOne({ slug: identifier, isActive: true }).populate('category');
        }
      } catch (e) {}
    }

    if (!product) {
      product = localStore.getProductByIdOrSlug(identifier);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Get related products
    let relatedProducts = [];
    if (isDBConnected() && product._id) {
      try {
        relatedProducts = await Product.find({
          category: product.category,
          _id: { $ne: product._id },
          isActive: true
        }).limit(4);
      } catch (e) {}
    }

    if (!relatedProducts || relatedProducts.length === 0) {
      relatedProducts = localStore.getProducts().filter(p => 
        String(p._id) !== String(product._id) && p.slug !== product.slug
      ).slice(0, 4);
    }

    res.json({ success: true, product, relatedProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Create product
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      category,
      shortDescription,
      description,
      ingredients,
      howToUse,
      benefits,
      price,
      compareAtPrice,
      costPrice,
      sku,
      stock,
      lowStockThreshold,
      images,
      variants,
      badges,
      isFeatured,
      isActive,
      tags,
      weight,
      seoTitle,
      seoDescription
    } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
    let product = null;

    if (isDBConnected()) {
      try {
        const cat = await Category.findById(category);
        product = await Product.create({
          name,
          slug,
          category,
          categoryName: cat ? cat.name : '',
          shortDescription: shortDescription || '',
          description,
          ingredients: ingredients || '',
          howToUse: howToUse || '',
          benefits: benefits || [],
          price: Number(price),
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : 0,
          costPrice: costPrice ? Number(costPrice) : 0,
          sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
          stock: Number(stock) || 0,
          lowStockThreshold: Number(lowStockThreshold) || 10,
          images: images || [],
          variants: variants || [],
          badges: badges || [],
          isFeatured: Boolean(isFeatured),
          isActive: isActive !== undefined ? Boolean(isActive) : true,
          tags: tags || [],
          weight: weight || '200ml',
          seoTitle: seoTitle || name,
          seoDescription: seoDescription || shortDescription
        });
      } catch (e) {}
    }

    if (!product) {
      const newLocalProd = {
        _id: 'prod-' + Date.now(),
        name,
        slug,
        category: category || 'cat-01',
        categoryName: 'Body Lotions & Milks',
        shortDescription: shortDescription || '',
        description,
        ingredients: ingredients || '',
        howToUse: howToUse || '',
        benefits: benefits || [],
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : 0,
        costPrice: costPrice ? Number(costPrice) : 0,
        sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
        stock: Number(stock) || 100,
        lowStockThreshold: Number(lowStockThreshold) || 10,
        images: images || ['/logo.webp'],
        variants: variants || [],
        badges: badges || [],
        isFeatured: Boolean(isFeatured),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        tags: tags || [],
        weight: weight || '200ml',
        createdAt: new Date().toISOString()
      };
      localStore.data.products.push(newLocalProd);
      localStore.saveData();
      product = newLocalProd;
    }

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update product
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    let product = null;
    if (isDBConnected()) {
      try {
        product = await Product.findById(req.params.id);
        if (product) {
          Object.assign(product, req.body);
          await product.save();
        }
      } catch (e) {}
    }

    const localProd = localStore.getProductByIdOrSlug(req.params.id);
    if (localProd) {
      Object.assign(localProd, req.body);
      localStore.saveData();
      if (!product) product = localProd;
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete product
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      try {
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
          await Product.findByIdAndDelete(id);
        } else {
          await Product.findOneAndDelete({ $or: [{ slug: id }, { sku: id }, { name: id }] });
        }
      } catch (e) {
        console.warn('[Delete Product DB Error]', e.message);
      }
    }

    // Also remove from localStore
    localStore.data.products = localStore.data.products.filter(p => 
      String(p._id) !== String(id) && 
      p.slug !== id && 
      p.sku !== id
    );
    localStore.saveData();

    res.json({ success: true, message: 'Product deleted successfully', id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
