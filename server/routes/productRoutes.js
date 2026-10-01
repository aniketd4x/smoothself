const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');

// Get all active products with optional query filtering
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, featured, minPrice, maxPrice, badge } = req.query;
    let query = { isActive: true };

    if (category) {
      if (category !== 'all') {
        const cat = await Category.findOne({ slug: category });
        if (cat) {
          query.category = cat._id;
        } else {
          query.categoryName = new RegExp(category, 'i');
        }
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

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (badge) {
      query.badges = badge;
    }

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

    const products = await Product.find(query).populate('category', 'name slug').sort(sortOptions);
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all products (including inactive) with pagination and inventory stats
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name slug').sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single product by slug or ID
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let product;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(identifier).populate('category');
    } else {
      product = await Product.findOne({ slug: identifier, isActive: true }).populate('category');
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Get related products from same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true
    }).limit(4);

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
    
    // Find category to cache name
    const cat = await Category.findById(category);

    const product = await Product.create({
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

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update product
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.body.category && req.body.category !== product.category.toString()) {
      const cat = await Category.findById(req.body.category);
      if (cat) product.categoryName = cat.name;
    }

    Object.assign(product, req.body);
    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete product
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Quick Stock / Inventory update
router.patch('/:id/inventory', protect, adminOnly, async (req, res) => {
  try {
    const { stock, lowStockThreshold } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (stock !== undefined) product.stock = Number(stock);
    if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);

    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
