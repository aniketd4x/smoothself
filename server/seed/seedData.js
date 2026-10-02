require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getSupabase, initSupabase } = require('../config/supabase');

const seedAll = async () => {
  try {
    console.log('🌱 Starting SmoothSelf database seed on Supabase...');

    const supabase = initSupabase() || getSupabase();
    if (!supabase) {
      console.error('❌ Supabase client could not be initialized. Please check your .env credentials.');
      process.exit(1);
    }

    console.log('🔗 Connected to Supabase:', process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);

    // 1. Clear existing data
    console.log('🧹 Clearing existing data in Supabase tables...');
    await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('coupons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Seed Users
    console.log('👤 Seeding Users...');
    const hashedAdminPassword = await bcrypt.hash('admin123456', 10);
    const hashedCustomerPassword = await bcrypt.hash('customer123456', 10);

    const { data: users, error: usersErr } = await supabase.from('users').insert([
      {
        name: 'Store Administrator',
        email: 'admin@smoothself.in',
        password: hashedAdminPassword,
        phone: '+91 99604 42750',
        role: 'admin',
        addresses: [],
        wishlist: [],
        is_active: true
      },
      {
        name: 'Store Administrator',
        email: 'admin@aurabotanica.com',
        password: hashedAdminPassword,
        phone: '+91 98765 00000',
        role: 'admin',
        addresses: [],
        wishlist: [],
        is_active: true
      },
      {
        name: 'Ananya Deshmukh',
        email: 'customer@aurabotanica.com',
        password: hashedCustomerPassword,
        phone: '+91 98200 12345',
        role: 'customer',
        addresses: [{
          name: 'Ananya Deshmukh',
          phone: '+91 98200 12345',
          street: '402, Highgrove Apartments, Indiranagar',
          apartment: 'Block B, 4th Floor',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
          isDefault: true
        }],
        wishlist: [],
        is_active: true
      },
      {
        name: 'SmoothSelf Member',
        email: 'customer@smoothself.in',
        password: hashedCustomerPassword,
        phone: '+91 99604 42750',
        role: 'customer',
        addresses: [],
        wishlist: [],
        is_active: true
      }
    ]).select();

    if (usersErr) throw new Error(`Users seed failed: ${usersErr.message}`);
    console.log(`✅ ${users.length} Users created (Admin: admin@aurabotanica.com / admin123456)`);

    // 3. Seed Categories
    console.log('📂 Seeding Categories...');
    const { data: categories, error: catErr } = await supabase.from('categories').insert([
      {
        name: 'Body Lotions & Milks',
        slug: 'body-lotions',
        description: 'Silky lightweight emulsions formulated for 24-hour hydration without heaviness.',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
        display_order: 1,
        is_active: true
      },
      {
        name: 'Whipped Body Butters',
        slug: 'body-butters',
        description: 'Rich, comforting balms and whipped shea soufflés for deep barrier repair.',
        image: 'https://images.unsplash.com/photo-1608248597359-5980a3c2ce52?q=80&w=800&auto=format&fit=crop',
        display_order: 2,
        is_active: true
      },
      {
        name: 'Exfoliating Scrubs',
        slug: 'exfoliating-scrubs',
        description: 'Botanical sugar and coffee polishes to renew skin texture and reveal baby softness.',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop',
        display_order: 3,
        is_active: true
      },
      {
        name: 'Elixirs & Body Oils',
        slug: 'body-oils',
        description: 'Dry body oils and illuminating essences that seal in moisture with a satin sheen.',
        image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=800&auto=format&fit=crop',
        display_order: 4,
        is_active: true
      }
    ]).select();

    if (catErr) throw new Error(`Categories seed failed: ${catErr.message}`);
    console.log(`✅ ${categories.length} Categories created`);

    const catLotions = categories.find(c => c.slug === 'body-lotions') || categories[0];
    const catButters = categories.find(c => c.slug === 'body-butters') || categories[1];
    const catScrubs = categories.find(c => c.slug === 'exfoliating-scrubs') || categories[2];
    const catOils = categories.find(c => c.slug === 'body-oils') || categories[3];

    // 4. Seed Products
    console.log('🛍️ Seeding Products...');
    const productsData = [
      {
        name: 'Velvet Vanilla & Vitamin E Restorative Body Lotion — 200ml',
        slug: 'velvet-vanilla-vitamin-e-body-lotion',
        category_id: catLotions.id,
        category_name: catLotions.name,
        short_description: 'Indulge your skin in luxurious, non-greasy hydration infused with Madagascar Vanilla and Vitamin E.',
        description: 'Our signature formulation combines cold-pressed sweet almond oil, pure Madagascar vanilla bean extract, and micronized Vitamin E to deeply hydrate, soothe dryness, and leave behind a warm, comforting scent that lingers for over 12 hours. Absorbs in seconds without any sticky residue.',
        ingredients: 'Aqua, Prunus Amygdalus Dulcis (Sweet Almond) Oil, Glycerin, Caprylic/Capric Triglyceride, Cetearyl Alcohol, Tocopheryl Acetate (Vitamin E), Vanilla Planifolia Fruit Extract, Butyrospermum Parkii (Shea Butter), Sodium Hyaluronate, Phenoxyethanol, Ethylhexylglycerin, Fragrance (Natural Vanilla Pods).',
        how_to_use: 'Smooth generously over cleansed skin after showering or whenever skin needs intense moisture. Pay special attention to dry areas like elbows, knees, and ankles.',
        benefits: [
          { title: '24-Hour Deep Hydration', description: 'Locks moisture into cellular layers for supple, plumping softness all day long.' },
          { title: 'Vitamin E Protection', description: 'Shields skin against environmental oxidative damage and free-radical stress.' },
          { title: 'Velvety Fast Absorption', description: 'Zero stickiness, absorbs instantly so you can dress immediately.' }
        ],
        price: 249,
        compare_at_price: 299,
        cost_price: 90,
        sku: 'AB-LOT-VAN-200',
        stock: 145,
        low_stock_threshold: 15,
        images: [
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1608248597359-5980a3c2ce52?q=80&w=1000&auto=format&fit=crop'
        ],
        variants: [
          {
            name: 'Size',
            options: [
              { title: '200ml', price: 249, compareAtPrice: 299, stock: 100, sku: 'AB-LOT-VAN-200' },
              { title: '400ml Jumbo', price: 449, compareAtPrice: 549, stock: 45, sku: 'AB-LOT-VAN-400' }
            ]
          }
        ],
        badges: ['BESTSELLER', 'HOT', '-17%'],
        rating: 4.9,
        num_reviews: 48,
        is_featured: true,
        is_active: true,
        tags: ['Vanilla', 'Vitamin E', 'Body Lotion', 'Moisturizer', 'Hydration', 'Bestseller'],
        weight: '200ml',
        seo_title: 'Velvet Vanilla & Vitamin E Restorative Body Lotion',
        seo_description: 'Indulge your skin in luxurious, non-greasy hydration infused with Madagascar Vanilla and Vitamin E.'
      },
      {
        name: 'Wild Strawberry & Bio-Retinol Glow Body Soufflé — 200ml',
        slug: 'wild-strawberry-bio-retinol-glow-souffle',
        category_id: catLotions.id,
        category_name: catLotions.name,
        short_description: 'Whipped cloud-like soufflé that brightens, tones, and drenches skin in juicy berry hydration.',
        description: 'Formulated with cold-pressed alpine strawberry seed oil, botanical bakuchiol (plant retinol), and multi-weight hyaluronic acid. Gently encourages cellular turnover while smoothing bumpy texture for glowing, silky-smooth skin.',
        ingredients: 'Aqua, Fragaria Ananassa (Strawberry) Seed Oil, Bakuchiol, Niacinamide (Vitamin B3), Squalane, Butyrospermum Parkii, Glyceryl Stearate, Allantoin, Natural Berry Aroma.',
        how_to_use: 'Gently massage onto arms, legs, and body in upward strokes until fully absorbed. Suitable for everyday morning and evening use.',
        benefits: [
          { title: 'Texture Smoothing', description: 'Bio-retinol helps reduce roughness and strawberry skin bumps.' },
          { title: 'Juicy Radiant Finish', description: 'Infuses natural antioxidants for a dewy, glowing finish.' }
        ],
        price: 269,
        compare_at_price: 329,
        cost_price: 95,
        sku: 'AB-LOT-STR-200',
        stock: 84,
        low_stock_threshold: 12,
        images: [
          'https://images.unsplash.com/photo-1608248597359-5980a3c2ce52?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop'
        ],
        variants: [
          {
            name: 'Size',
            options: [
              { title: '200ml', price: 269, compareAtPrice: 329, stock: 60, sku: 'AB-LOT-STR-200' },
              { title: '400ml Jumbo', price: 479, compareAtPrice: 599, stock: 24, sku: 'AB-LOT-STR-400' }
            ]
          }
        ],
        badges: ['NEW', '-18%'],
        rating: 4.8,
        num_reviews: 29,
        is_featured: true,
        is_active: true,
        tags: ['Strawberry', 'Glow', 'Bakuchiol', 'Body Souffle', 'Body Lotion'],
        weight: '200ml',
        seo_title: 'Wild Strawberry & Bio-Retinol Glow Body Soufflé',
        seo_description: 'Whipped cloud-like soufflé that brightens, tones, and drenches skin in juicy berry hydration.'
      },
      {
        name: 'Golden Honeycomb & Ghanaian Shea Intensive Body Butter — 200g',
        slug: 'golden-honeycomb-shea-body-butter',
        category_id: catButters.id,
        category_name: catButters.name,
        short_description: 'Ultra-nourishing melted butter infused with wild honey, cocoa butter, and raw shea.',
        description: 'For parched or stressed skin in need of restorative comfort. Our artisanal whipped butter forms a breathable protective blanket that seals in moisture for 48 hours without feeling occlusive or sticky.',
        ingredients: 'Butyrospermum Parkii (Shea Butter), Theobroma Cacao (Cocoa) Seed Butter, Mel (Wild Honey Extract), Simmondsia Chinensis (Jojoba) Oil, Helianthus Annuus Seed Oil, Tocopherol, Honey Scent.',
        how_to_use: 'Warm a small amount between your palms and massage into warm skin post-bath.',
        benefits: [
          { title: '48-Hour Barrier Shield', description: 'Intensive plant lipids replenish the lipid barrier.' },
          { title: 'Dry Flake Reliever', description: 'Instant comfort for dry elbows, cracked heels, and tight skin.' }
        ],
        price: 349,
        compare_at_price: 449,
        cost_price: 120,
        sku: 'AB-BUT-HON-200',
        stock: 62,
        low_stock_threshold: 10,
        images: [
          'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop'
        ],
        variants: [
          {
            name: 'Weight',
            options: [
              { title: '200g Tub', price: 349, compareAtPrice: 449, stock: 45, sku: 'AB-BUT-HON-200' },
              { title: '350g Value Pack', price: 549, compareAtPrice: 699, stock: 17, sku: 'AB-BUT-HON-350' }
            ]
          }
        ],
        badges: ['BESTSELLER', '-22%'],
        rating: 5.0,
        num_reviews: 34,
        is_featured: true,
        is_active: true,
        tags: ['Honey', 'Shea Butter', 'Dry Skin', 'Intensive Care'],
        weight: '200g',
        seo_title: 'Golden Honeycomb & Ghanaian Shea Intensive Body Butter',
        seo_description: 'Ultra-nourishing melted butter infused with wild honey, cocoa butter, and raw shea.'
      },
      {
        name: 'French Lavender & Roman Chamomile Midnight Rest Body Milk — 200ml',
        slug: 'french-lavender-chamomile-midnight-body-milk',
        category_id: catLotions.id,
        category_name: catLotions.name,
        short_description: 'Therapeutic sleep-inducing aroma paired with calming botanical hydration.',
        description: 'Unwind your evening with pure Provence lavender, Roman chamomile, and soothing oat milk. Formulated to calm nighttime restlessness while deeply replenishing the skin during its natural nocturnal repair cycle.',
        ingredients: 'Aqua, Avena Sativa (Oat) Kernel Extract, Lavandula Angustifolia Oil, Anthemis Nobilis (Chamomile) Flower Oil, Squalane, Cetyl Alcohol, Tocopheryl Acetate.',
        how_to_use: 'Apply right before bedtime with slow, sweeping strokes over shoulders, chest, and arms. Inhale the relaxing botanicals deeply.',
        benefits: [
          { title: 'Aromatherapeutic Relaxation', description: 'Calms mind and senses for better sleep quality.' },
          { title: 'Nocturnal Skin Repair', description: 'Supports cell regeneration throughout the night.' }
        ],
        price: 259,
        compare_at_price: 319,
        cost_price: 90,
        sku: 'AB-LOT-LAV-200',
        stock: 95,
        low_stock_threshold: 10,
        images: [
          'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop'
        ],
        variants: [
          {
            name: 'Size',
            options: [
              { title: '200ml', price: 259, compareAtPrice: 319, stock: 70, sku: 'AB-LOT-LAV-200' },
              { title: '400ml Jumbo', price: 469, compareAtPrice: 589, stock: 25, sku: 'AB-LOT-LAV-400' }
            ]
          }
        ],
        badges: ['POPULAR'],
        rating: 4.9,
        num_reviews: 22,
        is_featured: false,
        is_active: true,
        tags: ['Lavender', 'Chamomile', 'Sleep', 'Night Care'],
        weight: '200ml',
        seo_title: 'French Lavender & Roman Chamomile Midnight Rest Body Milk',
        seo_description: 'Therapeutic sleep-inducing aroma paired with calming botanical hydration.'
      },
      {
        name: 'Arabica Roast & Brown Demerara Smoothing Body Polish — 250g',
        slug: 'arabica-roast-brown-sugar-body-polish',
        category_id: catScrubs.id,
        category_name: catScrubs.name,
        short_description: 'Caffeine-rich antioxidant scrub that buffs away dead skin cells and boosts micro-circulation.',
        description: 'Finely ground ethically sourced Arabica beans suspended in rich almond and coconut oils with golden brown Demerara sugar crystals. Buffs away dry dead skin, awakens dull limbs, and leaves a silky veil of moisture.',
        ingredients: 'Sucrose (Demerara Brown Sugar), Coffea Arabica Seed Powder, Cocos Nucifera (Coconut) Oil, Prunus Amygdalus Dulcis Oil, Vanilla Extract, Sea Salt, Tocopherol.',
        how_to_use: 'In the shower, massage onto wet skin using circular motions. Rinse thoroughly with warm water. Use 2 to 3 times per week.',
        benefits: [
          { title: 'Instant Softness', description: 'Removes dull surface cells in single application.' },
          { title: 'Energizing Circulation', description: 'Caffeine invigorates skin surface for firmer feel.' }
        ],
        price: 329,
        compare_at_price: 429,
        cost_price: 110,
        sku: 'AB-SCR-COF-250',
        stock: 58,
        low_stock_threshold: 10,
        images: [
          'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1608248597359-5980a3c2ce52?q=80&w=1000&auto=format&fit=crop'
        ],
        variants: [
          {
            name: 'Weight',
            options: [
              { title: '250g Jar', price: 329, compareAtPrice: 429, stock: 58, sku: 'AB-SCR-COF-250' }
            ]
          }
        ],
        badges: ['HOT', '-23%'],
        rating: 4.8,
        num_reviews: 19,
        is_featured: false,
        is_active: true,
        tags: ['Coffee', 'Scrub', 'Exfoliation', 'Body Polish'],
        weight: '250g',
        seo_title: 'Arabica Roast & Brown Demerara Smoothing Body Polish',
        seo_description: 'Caffeine-rich antioxidant scrub that buffs away dead skin cells and boosts micro-circulation.'
      },
      {
        name: 'Neroli Blossom & Mediterranean Squalane Illuminating Body Oil — 100ml',
        slug: 'neroli-blossom-squalane-illuminating-body-oil',
        category_id: catOils.id,
        category_name: catOils.name,
        short_description: 'Golden dry elixir that absorbs instantly for high-gloss, luminous, perfumed skin.',
        description: 'An ethereal multi-use body nectar blending 100% plant-derived squalane, camellia seed oil, and precious orange blossom neroli essence. Gives the skin a radiant, non-oily lit-from-within glow.',
        ingredients: 'Squalane (Olive Derived), Camellia Oleifera Seed Oil, Citrus Aurantium (Neroli) Flower Oil, Simmondsia Chinensis Seed Oil, Helianthus Annuus Seed Oil, Rosa Damascena Flower Extract, Tocopherol.',
        how_to_use: 'Mist or drop into palms and smooth over damp skin after bathing. Can also be applied to collarbones, shoulders, and legs for an instant luminous highlight.',
        benefits: [
          { title: 'Non-Greasy Satin Finish', description: 'Featherlight botanical oils that absorb in 30 seconds.' },
          { title: 'Luminous Glow', description: 'Reflects ambient light for healthy, glowing skin.' }
        ],
        price: 499,
        compare_at_price: 649,
        cost_price: 160,
        sku: 'AB-OIL-NER-100',
        stock: 40,
        low_stock_threshold: 8,
        images: [
          'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop'
        ],
        variants: [
          {
            name: 'Size',
            options: [
              { title: '100ml Bottle', price: 499, compareAtPrice: 649, stock: 40, sku: 'AB-OIL-NER-100' }
            ]
          }
        ],
        badges: ['NEW', 'LUXURY'],
        rating: 5.0,
        num_reviews: 14,
        is_featured: true,
        is_active: true,
        tags: ['Body Oil', 'Neroli', 'Glow', 'Squalane'],
        weight: '100ml',
        seo_title: 'Neroli Blossom & Mediterranean Squalane Illuminating Body Oil',
        seo_description: 'Golden dry elixir that absorbs instantly for high-gloss, luminous, perfumed skin.'
      }
    ];

    const { data: createdProducts, error: prodErr } = await supabase.from('products').insert(productsData).select();
    if (prodErr) throw new Error(`Products seed failed: ${prodErr.message}`);
    console.log(`✅ ${createdProducts.length} Products created`);

    // 5. Seed Coupons
    console.log('🏷️ Seeding Coupons...');
    const { data: coupons, error: coupErr } = await supabase.from('coupons').insert([
      {
        code: 'WELCOME10',
        discount_type: 'percentage',
        discount_value: 10,
        min_order_amount: 0,
        max_discount_amount: 200,
        expiry_date: new Date('2028-12-31').toISOString(),
        usage_limit: 5000,
        is_active: true
      },
      {
        code: 'GLOW20',
        discount_type: 'percentage',
        discount_value: 20,
        min_order_amount: 799,
        max_discount_amount: 300,
        expiry_date: new Date('2028-12-31').toISOString(),
        usage_limit: 2000,
        is_active: true
      },
      {
        code: 'SMOOTH50',
        discount_type: 'fixed',
        discount_value: 50,
        min_order_amount: 450,
        max_discount_amount: 50,
        expiry_date: new Date('2028-12-31').toISOString(),
        usage_limit: 3000,
        is_active: true
      }
    ]).select();

    if (coupErr) throw new Error(`Coupons seed failed: ${coupErr.message}`);
    console.log(`✅ ${coupons.length} Coupons created (WELCOME10, GLOW20, SMOOTH50)`);

    // 6. Seed Reviews
    console.log('⭐ Seeding Reviews...');
    const vanilla = createdProducts[0];
    const strawberry = createdProducts[1];

    const { data: reviews, error: revErr } = await supabase.from('reviews').insert([
      {
        product_id: vanilla.id,
        user_name: 'Priya Sharma',
        user_email: 'priya.s@example.com',
        rating: 5,
        title: 'Silky smooth skin & divine fragrance!',
        comment: 'After using the Vanilla & Vitamin E Body Lotion, my skin feels incredibly soft and moisturized throughout the workday in AC. The fragrance lasts for 8+ hours and feels so luxurious without any sticky residue!',
        is_verified_buyer: true,
        is_approved: true
      },
      {
        product_id: vanilla.id,
        user_name: 'Meera Iyer',
        user_email: 'meera.i@example.com',
        rating: 5,
        title: 'Holy grail body lotion',
        comment: 'I have very dry elbows and legs, and this worked wonders within 3 days. Super fast delivery and the packaging is gorgeous. Will definitely repurchase the 400ml jumbo size.',
        is_verified_buyer: true,
        is_approved: true
      },
      {
        product_id: strawberry.id,
        user_name: 'Rhea Sen',
        user_email: 'rhea.sen@example.com',
        rating: 5,
        title: 'Lightweight & fresh berry scent!',
        comment: 'The strawberry souffle is so lightweight and absorbs in seconds! Love how it leaves my skin glowing without feeling heavy or oily in humid weather.',
        is_verified_buyer: true,
        is_approved: true
      }
    ]).select();

    if (revErr) throw new Error(`Reviews seed failed: ${revErr.message}`);
    console.log(`✅ ${reviews.length} Reviews created`);

    // 7. Seed Settings
    console.log('⚙️ Seeding Settings...');
    const { data: settings, error: settErr } = await supabase.from('settings').insert([
      {
        brand_name: 'SMOOTHSELF',
        logo_url: '/logo.webp',
        tagline: 'Naturally Silky Smooth',
        announcement_text: 'Free shipping order above ₹ 450',
        announcement_active: true,
        free_shipping_threshold: 450,
        standard_shipping_fee: 50,
        express_shipping_fee: 100,
        contact_email: 'support@smoothself.in',
        contact_phone: '+91 99604 42750',
        contact_address: 'Mumbai, Maharashtra',
        currency_symbol: '₹'
      }
    ]).select();

    if (settErr) throw new Error(`Settings seed failed: ${settErr.message}`);
    console.log('✅ Settings created');

    console.log('\n🎉 ALL SUPABASE SEEDING COMPLETED SUCCESSFULLY WITH ZERO ERRORS!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedAll();
