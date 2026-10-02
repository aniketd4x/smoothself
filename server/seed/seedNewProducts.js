require('dotenv').config();
const { getSupabase, initSupabase } = require('../config/supabase');

const seedNewProducts = async () => {
  try {
    console.log('🌱 Seeding 2 new SmoothSelf products...');

    const supabase = initSupabase() || getSupabase();
    if (!supabase) {
      console.error('❌ Supabase not connected.');
      process.exit(1);
    }

    // 1. Check for duplicates
    const SLUGS = ['strawberry-vitamin-e-body-lotion', 'vanilla-vitamin-e-body-lotion'];
    const { data: existing, error: dupErr } = await supabase
      .from('products')
      .select('id, name, slug')
      .in('slug', SLUGS);

    if (dupErr) throw new Error(`Duplicate check failed: ${dupErr.message}`);

    if (existing && existing.length > 0) {
      console.log('⚠️  Products already exist (no duplicates will be created):');
      existing.forEach(p => console.log(`   - ${p.name} (${p.slug})`));
      process.exit(0);
    }

    // 2. Get body-lotions category
    const { data: cats, error: catErr } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', 'body-lotions')
      .single();

    if (catErr || !cats) throw new Error(`Body lotions category not found: ${catErr?.message}`);
    console.log(`✅ Category found: ${cats.name} (${cats.id})`);

    const categoryId = cats.id;
    const categoryName = cats.name;

    // 3. Build the 2 new product records
    const newProducts = [
      {
        name: 'Strawberry & Vitamin E Body Lotion',
        slug: 'strawberry-vitamin-e-body-lotion',
        category_id: categoryId,
        category_name: categoryName,
        short_description:
          'A lightweight body lotion enriched with Strawberry Extracts and Vitamin E that helps nourish, hydrate, and soften the skin while leaving a refreshing fruity fragrance.',
        description: `<p>SmoothSelf Strawberry &amp; Vitamin E Body Lotion is a lightweight daily-use body lotion designed to provide nourishment and long-lasting hydration. Enriched with Strawberry Extracts and Vitamin E, it helps keep the skin soft, smooth, moisturized, and naturally radiant.</p>
<p>The lightweight formula absorbs quickly into the skin without leaving a greasy or heavy feeling. Its refreshing strawberry fragrance provides a pleasant fruity experience, making it suitable for everyday skincare.</p>
<h4>Key Benefits</h4>
<ul>
  <li>Helps provide deep nourishment</li>
  <li>Helps keep skin moisturized for up to 24 hours</li>
  <li>Helps improve the appearance of dry and dull skin</li>
  <li>Leaves skin feeling soft and smooth</li>
  <li>Lightweight and fast-absorbing formula</li>
  <li>Non-greasy finish</li>
  <li>Refreshing strawberry fragrance</li>
  <li>Suitable for daily use</li>
</ul>
<h4>Key Ingredients</h4>
<ul>
  <li>Strawberry Extract</li>
  <li>Vitamin E</li>
</ul>
<h4>Product Information</h4>
<ul>
  <li><strong>Product Type:</strong> Body Lotion</li>
  <li><strong>Net Quantity:</strong> 200ml</li>
  <li><strong>Brand:</strong> SmoothSelf</li>
  <li><strong>Fragrance:</strong> Strawberry</li>
  <li><strong>Suitable For:</strong> Daily use</li>
  <li><strong>Texture:</strong> Lightweight lotion</li>
</ul>`,
        ingredients: 'Strawberry Extract, Vitamin E',
        how_to_use:
          'Apply generously over cleansed skin after showering or bathing. Massage in circular motions until fully absorbed. Suitable for daily use.',
        benefits: [
          { title: 'Deep Nourishment', description: 'Helps provide deep nourishment to keep skin healthy and supple.' },
          { title: '24-Hour Moisturization', description: 'Helps keep skin moisturized for up to 24 hours.' },
          { title: 'Soft & Smooth Skin', description: 'Leaves skin feeling soft and smooth with regular use.' },
          { title: 'Fast-Absorbing Formula', description: 'Lightweight and fast-absorbing formula with a non-greasy finish.' },
          { title: 'Refreshing Fragrance', description: 'Refreshing strawberry fragrance for a pleasant everyday experience.' }
        ],
        price: 249,
        compare_at_price: 299,
        sku: 'SMOOTHSELF-STRAWBERRY-200ML',
        stock: 0,
        low_stock_threshold: 0,
        images: [
          'https://images.unsplash.com/photo-1608248597359-5980a3c2ce52?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop'
        ],
        variants: [],
        badges: ['SOLD OUT'],
        rating: null,
        num_reviews: 0,
        is_featured: false,
        is_active: false,
        tags: ['Strawberry', 'Vitamin E', 'Body Lotion', 'Moisturizer', 'Hydration', 'Sold Out'],
        weight: '200ml',
        seo_title: 'Strawberry & Vitamin E Body Lotion',
        seo_description:
          'A lightweight body lotion enriched with Strawberry Extracts and Vitamin E that helps nourish, hydrate, and soften the skin while leaving a refreshing fruity fragrance.'
      },
      {
        name: 'Vanilla & Vitamin E Body Lotion',
        slug: 'vanilla-vitamin-e-body-lotion',
        category_id: categoryId,
        category_name: categoryName,
        short_description:
          'A silky and lightweight body lotion enriched with Vanilla and Vitamin E that helps hydrate, nourish, and soften the skin while providing a delicate vanilla fragrance.',
        description: `<p>SmoothSelf Vanilla &amp; Vitamin E Body Lotion is a silky, lightweight body lotion designed for everyday hydration and nourishment. Enriched with Vanilla and Vitamin E, it helps keep the skin soft, smooth, and moisturized.</p>
<p>The quick-absorbing formula provides comfortable daily hydration without leaving a greasy residue. Its delicate vanilla fragrance adds a calming and pleasant touch to your everyday skincare routine.</p>
<h4>Key Benefits</h4>
<ul>
  <li>Helps provide deep hydration</li>
  <li>Helps nourish dry skin</li>
  <li>Helps keep skin soft and smooth</li>
  <li>Quick-absorbing formula</li>
  <li>Non-greasy finish</li>
  <li>Delicate vanilla fragrance</li>
  <li>Suitable for daily use</li>
  <li>Suitable for all skin types</li>
</ul>
<h4>Key Ingredients</h4>
<ul>
  <li>Vanilla</li>
  <li>Vitamin E</li>
</ul>
<h4>Product Information</h4>
<ul>
  <li><strong>Product Type:</strong> Body Lotion</li>
  <li><strong>Net Quantity:</strong> 200ml</li>
  <li><strong>Brand:</strong> SmoothSelf</li>
  <li><strong>Fragrance:</strong> Vanilla</li>
  <li><strong>Suitable For:</strong> All skin types</li>
  <li><strong>Texture:</strong> Silky lightweight lotion</li>
</ul>`,
        ingredients: 'Vanilla, Vitamin E',
        how_to_use:
          'Apply generously over cleansed skin after showering or bathing. Massage in circular motions until fully absorbed. Suitable for daily use for all skin types.',
        benefits: [
          { title: 'Deep Hydration', description: 'Helps provide deep hydration for soft, comfortable skin.' },
          { title: 'Nourishes Dry Skin', description: 'Helps nourish dry skin and restore its natural moisture balance.' },
          { title: 'Soft & Smooth', description: 'Helps keep skin soft and smooth with regular use.' },
          { title: 'Quick-Absorbing', description: 'Quick-absorbing formula with a non-greasy finish.' },
          { title: 'Delicate Fragrance', description: 'Delicate vanilla fragrance suitable for all skin types.' }
        ],
        price: 249,
        compare_at_price: 299,
        sku: 'SMOOTHSELF-VANILLA-200ML',
        stock: 0,
        low_stock_threshold: 0,
        images: [
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1000&auto=format&fit=crop'
        ],
        variants: [],
        badges: ['SOLD OUT'],
        rating: null,
        num_reviews: 0,
        is_featured: false,
        is_active: false,
        tags: ['Vanilla', 'Vitamin E', 'Body Lotion', 'Moisturizer', 'Hydration', 'Sold Out'],
        weight: '200ml',
        seo_title: 'Vanilla & Vitamin E Body Lotion',
        seo_description:
          'A silky and lightweight body lotion enriched with Vanilla and Vitamin E that helps hydrate, nourish, and soften the skin while providing a delicate vanilla fragrance.'
      }
    ];

    // 4. Insert both products
    const { data: created, error: insertErr } = await supabase
      .from('products')
      .insert(newProducts)
      .select('id, name, slug, price, compare_at_price, stock, is_active, sku');

    if (insertErr) throw new Error(`Insert failed: ${insertErr.message}`);

    console.log(`\n✅ Successfully created ${created.length} new products:\n`);
    created.forEach(p => {
      console.log(`   📦 ${p.name}`);
      console.log(`      ID:     ${p.id}`);
      console.log(`      Slug:   ${p.slug}`);
      console.log(`      SKU:    ${p.sku}`);
      console.log(`      Price:  ₹${p.price} (MRP: ₹${p.compare_at_price})`);
      console.log(`      Stock:  ${p.stock}`);
      console.log(`      Active: ${p.is_active}`);
      console.log('');
    });

    console.log('🎉 New products seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedNewProducts();
