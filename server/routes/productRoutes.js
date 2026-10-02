const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');
const { protect, adminOnly } = require('../middleware/auth');

// Get all active products with optional query filtering
router.get('/', async (req, res) => {
  try {
    const products = await supabaseService.getProducts(req.query);
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all products (including inactive)
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const products = await supabaseService.getProducts({ isActive: false });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single product by slug or ID
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const product = await supabaseService.getProductByIdOrSlug(identifier);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const allProducts = await supabaseService.getProducts({ isActive: true });
    const relatedProducts = allProducts.filter(p => 
      String(p._id) !== String(product._id) && p.slug !== product.slug
    ).slice(0, 4);

    res.json({ success: true, product, relatedProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Create product
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const product = await supabaseService.createProduct(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Update product
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await supabaseService.updateProduct(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Quick Inventory stock update
router.patch('/:id/inventory', protect, adminOnly, async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await supabaseService.updateProduct(req.params.id, { stock: Number(stock) });
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
    await supabaseService.deleteProduct(id);
    res.json({ success: true, message: 'Product deleted successfully', id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
