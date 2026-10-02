require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const Banner = require('../models/Banner');
const BlogPost = require('../models/BlogPost');
const FAQ = require('../models/FAQ');
const Setting = require('../models/Setting');
const connectDB = require('../config/db');

const seedAll = async () => {
  try {
    await connectDB();
    console.log('Seeding Aura Botanica Database...');

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();
    await Review.deleteMany();
    await Banner.deleteMany();
    await BlogPost.deleteMany();
    await FAQ.deleteMany();
    await Setting.deleteMany();

    // 1. Create Users
    const admin = await User.create({
      name: 'Store Administrator',
      email: 'admin@aurabotanica.com',
      password: 'admin123456',
      role: 'admin',
      phone: '+91 98765 00000'
    });

    const demoCustomer = await User.create({
      name: 'Ananya Deshmukh',
      email: 'customer@aurabotanica.com',
      password: 'customer123456',
      role: 'customer',
      phone: '+91 98200 12345',
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
      }]
    });

    console.log('Users created: Admin (admin@aurabotanica.com / admin123456)');

    // 2. Create Categories
    const catLotion = await Category.create({
      name: 'Body Lotions & Milks',
      slug: 'body-lotions',
      description: 'Silky lightweight emulsions formulated for 24-hour hydration without heaviness.',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
      order: 1
    });

    const catButter = await Category.create({
      name: 'Whipped Body Butters',
      slug: 'body-butters',
      description: 'Rich, comforting balms and whipped shea soufflés for deep barrier repair.',
      image: 'https://images.unsplash.com/photo-1608248597359-5980a3c2ce52?q=80&w=800&auto=format&fit=crop',
      order: 2
    });

    const catScrubs = await Category.create({
      name: 'Exfoliating Scrubs',
      slug: 'exfoliating-scrubs',
      description: 'Botanical sugar and coffee polishes to renew skin texture and reveal baby softness.',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop',
      order: 3
    });

    const catOils = await Category.create({
      name: 'Elixirs & Body Oils',
      slug: 'body-oils',
      description: 'Dry body oils and illuminating essences that seal in moisture with a satin sheen.',
      image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=800&auto=format&fit=crop',
      order: 4
    });

    console.log('Categories created');

    // 3. Create Products
    const productsData = [
      {
        name: 'Velvet Vanilla & Vitamin E Restorative Body Lotion — 200ml',
        slug: 'velvet-vanilla-vitamin-e-body-lotion',
        category: catLotion._id,
        categoryName: catLotion.name,
        shortDescription: 'Indulge your skin in luxurious, non-greasy hydration infused with Madagascar Vanilla and Vitamin E.',
        description: 'Our signature formulation combines cold-pressed sweet almond oil, pure Madagascar vanilla bean extract, and micronized Vitamin E to deeply hydrate, soothe dryness, and leave behind a warm, comforting scent that lingers for over 12 hours. Absorbs in seconds without any sticky residue.',
        ingredients: 'Aqua, Prunus Amygdalus Dulcis (Sweet Almond) Oil, Glycerin, Caprylic/Capric Triglyceride, Cetearyl Alcohol, Tocopheryl Acetate (Vitamin E), Vanilla Planifolia Fruit Extract, Butyrospermum Parkii (Shea Butter), Sodium Hyaluronate, Phenoxyethanol, Ethylhexylglycerin, Fragrance (Natural Vanilla Pods).',
        howToUse: 'Smooth generously over cleansed skin after showering or whenever skin needs intense moisture. Pay special attention to dry areas like elbows, knees, and ankles.',
        benefits: [
          { title: '24-Hour Deep Hydration', description: 'Locks moisture into cellular layers for supple, plumping softness all day long.' },
          { title: 'Vitamin E Protection', description: 'Shields skin against environmental oxidative damage and free-radical stress.' },
          { title: 'Velvety Fast Absorption', description: 'Zero stickiness, absorbs instantly so you can dress immediately.' }
        ],
        price: 249,
        compareAtPrice: 299,
        costPrice: 90,
        sku: 'AB-LOT-VAN-200',
        stock: 145,
        lowStockThreshold: 15,
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
        numReviews: 48,
        isFeatured: true,
        tags: ['Vanilla', 'Vitamin E', 'Body Lotion', 'Moisturizer', 'Hydration', 'Bestseller'],
        weight: '200ml'
      },
      {
        name: 'Wild Strawberry & Bio-Retinol Glow Body Soufflé — 200ml',
        slug: 'wild-strawberry-bio-retinol-glow-souffle',
        category: catLotion._id,
        categoryName: catLotion.name,
        shortDescription: 'Whipped cloud-like soufflé that brightens, tones, and drenches skin in juicy berry hydration.',
        description: 'Formulated with cold-pressed alpine strawberry seed oil, botanical bakuchiol (plant retinol), and multi-weight hyaluronic acid. Gently encourages cellular turnover while smoothing bumpy texture for glowing, silky-smooth skin.',
        ingredients: 'Aqua, Fragaria Ananassa (Strawberry) Seed Oil, Bakuchiol, Niacinamide (Vitamin B3), Squalane, Butyrospermum Parkii, Glyceryl Stearate, Allantoin, Natural Berry Aroma.',
        howToUse: 'Gently massage onto arms, legs, and body in upward strokes until fully absorbed. Suitable for everyday morning and evening use.',
        benefits: [
          { title: 'Texture Smoothing', description: 'Bio-retinol helps reduce roughness and strawberry skin bumps.' },
          { title: 'Juicy Radiant Finish', description: 'Infuses natural antioxidants for a dewy, glowing finish.' }
        ],
        price: 269,
        compareAtPrice: 329,
        costPrice: 95,
        sku: 'AB-LOT-STR-200',
        stock: 84,
        lowStockThreshold: 12,
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
        numReviews: 29,
        isFeatured: true,
        tags: ['Strawberry', 'Glow', 'Bakuchiol', 'Body Souffle', 'Body Lotion'],
        weight: '200ml'
      },
      {
        name: 'Golden Honeycomb & Ghanaian Shea Intensive Body Butter — 200g',
        slug: 'golden-honeycomb-shea-body-butter',
        category: catButter._id,
        categoryName: catButter.name,
        shortDescription: 'Ultra-nourishing melted butter infused with wild honey, cocoa butter, and raw shea.',
        description: 'For parched or stressed skin in need of restorative comfort. Our artisanal whipped butter forms a breathable protective blanket that seals in moisture for 48 hours without feeling occlusive or sticky.',
        ingredients: 'Butyrospermum Parkii (Shea Butter), Theobroma Cacao (Cocoa) Seed Butter, Mel (Wild Honey Extract), Simmondsia Chinensis (Jojoba) Oil, Helianthus Annuus Seed Oil, Tocopherol, Honey Scent.',
        howToUse: 'Warm a small amount between your palms and massage into warm skin post-bath.',
        benefits: [
          { title: '48-Hour Barrier Shield', description: 'Intensive plant lipids replenish the lipid barrier.' },
          { title: 'Dry Flake Reliever', description: 'Instant comfort for dry elbows, cracked heels, and tight skin.' }
        ],
        price: 349,
        compareAtPrice: 449,
        costPrice: 120,
        sku: 'AB-BUT-HON-200',
        stock: 62,
        lowStockThreshold: 10,
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
        numReviews: 34,
        isFeatured: true,
        tags: ['Honey', 'Shea Butter', 'Dry Skin', 'Intensive Care'],
        weight: '200g'
      },
      {
        name: 'French Lavender & Roman Chamomile Midnight Rest Body Milk — 200ml',
        slug: 'french-lavender-chamomile-midnight-body-milk',
        category: catLotion._id,
        categoryName: catLotion.name,
        shortDescription: 'Therapeutic sleep-inducing aroma paired with calming botanical hydration.',
        description: 'Unwind your evening with pure Provence lavender, Roman chamomile, and soothing oat milk. Formulated to calm nighttime restlessness while deeply replenishing the skin during its natural nocturnal repair cycle.',
        ingredients: 'Aqua, Avena Sativa (Oat) Kernel Extract, Lavandula Angustifolia Oil, Anthemis Nobilis (Chamomile) Flower Oil, Squalane, Cetyl Alcohol, Tocopheryl Acetate.',
        howToUse: 'Apply right before bedtime with slow, sweeping strokes over shoulders, chest, and arms. Inhale the relaxing botanicals deeply.',
        benefits: [
          { title: 'Aromatherapeutic Relaxation', description: 'Calms mind and senses for better sleep quality.' },
          { title: 'Nocturnal Skin Repair', description: 'Supports cell regeneration throughout the night.' }
        ],
        price: 259,
        compareAtPrice: 319,
        costPrice: 90,
        sku: 'AB-LOT-LAV-200',
        stock: 95,
        lowStockThreshold: 10,
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
        numReviews: 22,
        isFeatured: false,
        tags: ['Lavender', 'Chamomile', 'Sleep', 'Night Care'],
        weight: '200ml'
      },
      {
        name: 'Arabica Roast & Brown Demerara Smoothing Body Polish — 250g',
        slug: 'arabica-roast-brown-sugar-body-polish',
        category: catScrubs._id,
        categoryName: catScrubs.name,
        shortDescription: 'Caffeine-rich antioxidant scrub that buffs away dead skin cells and boosts micro-circulation.',
        description: 'Finely ground ethically sourced Arabica beans suspended in rich almond and coconut oils with golden brown Demerara sugar crystals. Buffs away dry dead skin, awakens dull limbs, and leaves a silky veil of moisture.',
        ingredients: 'Sucrose (Demerara Brown Sugar), Coffea Arabica Seed Powder, Cocos Nucifera (Coconut) Oil, Prunus Amygdalus Dulcis Oil, Vanilla Extract, Sea Salt, Tocopherol.',
        howToUse: 'In the shower, massage onto wet skin using circular motions. Rinse thoroughly with warm water. Use 2 to 3 times per week.',
        benefits: [
          { title: 'Instant Softness', description: 'Removes dull surface cells in single application.' },
          { title: 'Energizing Circulation', description: 'Caffeine invigorates skin surface for firmer feel.' }
        ],
        price: 329,
        compareAtPrice: 429,
        costPrice: 110,
        sku: 'AB-SCR-COF-250',
        stock: 58,
        lowStockThreshold: 10,
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
        numReviews: 19,
        isFeatured: false,
        tags: ['Coffee', 'Scrub', 'Exfoliation', 'Body Polish'],
        weight: '250g'
      },
      {
        name: 'Neroli Blossom & Mediterranean Squalane Illuminating Body Oil — 100ml',
        slug: 'neroli-blossom-squalane-illuminating-body-oil',
        category: catOils._id,
        categoryName: catOils.name,
        shortDescription: 'Golden dry elixir that absorbs instantly for high-gloss, luminous, perfumed skin.',
        description: 'An ethereal multi-use body nectar blending 100% plant-derived squalane, camellia seed oil, and precious orange blossom neroli essence. Gives the skin a radiant, non-oily lit-from-within glow.',
        ingredients: 'Squalane (Olive Derived), Camellia Oleifera Seed Oil, Citrus Aurantium (Neroli) Flower Oil, Simmondsia Chinensis Seed Oil, Helianthus Annuus Seed Oil, Rosa Damascena Flower Extract, Tocopherol.',
        howToUse: 'Mist or drop into palms and smooth over damp skin after bathing. Can also be applied to collarbones, shoulders, and legs for an instant luminous highlight.',
        benefits: [
          { title: 'Non-Greasy Satin Finish', description: 'Featherlight botanical oils that absorb in 30 seconds.' },
          { title: 'Luminous Glow', description: 'Reflects ambient light for healthy, glowing skin.' }
        ],
        price: 499,
        compareAtPrice: 649,
        costPrice: 160,
        sku: 'AB-OIL-NER-100',
        stock: 40,
        lowStockThreshold: 8,
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
        numReviews: 14,
        isFeatured: true,
        tags: ['Body Oil', 'Neroli', 'Glow', 'Squalane'],
        weight: '100ml'
      }
    ];

    const createdProducts = await Product.insertMany(productsData);
    console.log(`Products created (${createdProducts.length} items)`);

    // 4. Create Coupons
    await Coupon.create([
      {
        code: 'WELCOME10',
        description: '10% off for all first-time customers',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscountAmount: 200,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 5000,
        isActive: true
      },
      {
        code: 'GLOW20',
        description: '20% off on orders above ₹799',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 799,
        maxDiscountAmount: 300,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 2000,
        isActive: true
      },
      {
        code: 'SMOOTH50',
        description: 'Flat ₹50 off on orders above ₹450',
        discountType: 'fixed',
        discountValue: 50,
        minOrderAmount: 450,
        maxDiscountAmount: 50,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 3000,
        isActive: true
      }
    ]);
    console.log('Coupons created (WELCOME10, GLOW20, SMOOTH50)');

    // 5. Create Reviews
    const vanillaProduct = createdProducts[0];
    const strawberryProduct = createdProducts[1];

    await Review.create([
      {
        product: vanillaProduct._id,
        user: demoCustomer._id,
        userName: 'Priya Sharma',
        userEmail: 'priya.s@example.com',
        rating: 5,
        title: 'Silky smooth skin & divine fragrance!',
        comment: 'After using the Vanilla & Vitamin E Body Lotion, my skin feels incredibly soft and moisturized throughout the workday in AC. The fragrance lasts for 8+ hours and feels so luxurious without any sticky residue!',
        isVerifiedPurchase: true,
        isApproved: true
      },
      {
        product: vanillaProduct._id,
        userName: 'Meera Iyer',
        userEmail: 'meera.i@example.com',
        rating: 5,
        title: 'Holy grail body lotion',
        comment: 'I have very dry elbows and legs, and this worked wonders within 3 days. Super fast delivery and the packaging is gorgeous. Will definitely repurchase the 400ml jumbo size.',
        isVerifiedPurchase: true,
        isApproved: true
      },
      {
        product: strawberryProduct._id,
        userName: 'Rhea Sen',
        userEmail: 'rhea.sen@example.com',
        rating: 5,
        title: 'Lightweight & fresh berry scent!',
        comment: 'The strawberry souffle is so lightweight and absorbs in seconds! Love how it leaves my skin glowing without feeling heavy or oily in humid weather.',
        isVerifiedPurchase: true,
        isApproved: true
      }
    ]);
    console.log('Reviews created');

    // 6. Create Banners
    await Banner.create([
      {
        title: 'Deep Skin Hydration & Long Lasting Fragrance',
        subtitle: 'Restorative Botanical Formulations Infused with Vitamin E & Pure Plant Oils',
        tagline: 'CLEAN BEAUTY • 100% VEGAN • DERMATOLOGICALLY APPROVED',
        buttonText: 'Shop Bestsellers',
        buttonLink: '/shop',
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1600&auto=format&fit=crop',
        order: 1,
        isActive: true
      },
      {
        title: 'The Art of Mindful Self-Care',
        subtitle: 'Experience 48-Hour Silky Barrier Protection with Organic Whipped Butters',
        tagline: 'PREMIUM ARTISANAL FORMULATIONS',
        buttonText: 'Explore Body Butters',
        buttonLink: '/shop?category=body-butters',
        imageUrl: 'https://images.unsplash.com/photo-1608248597359-5980a3c2ce52?q=80&w=1600&auto=format&fit=crop',
        order: 2,
        isActive: true
      }
    ]);
    console.log('Banners created');

    // 7. Create Blog Posts
    await BlogPost.create([
      {
        title: 'Why Vitamin E & Plant Squalane Are the Ultimate Skincare Duo for All-Day Hydration',
        slug: 'vitamin-e-squalane-all-day-hydration',
        excerpt: 'Discover how lipid-rich botanicals prevent transepidermal water loss and keep your moisture barrier locked in dry climates.',
        content: `Maintaining hydrated, healthy skin goes beyond simply drinking water. Your outer skin barrier requires bio-compatible lipids that seal in water molecules.

### The Problem of Transepidermal Water Loss (TEWL)
During prolonged exposure to indoor air conditioning, UV rays, or seasonal shifts, your skin loses water rapidly through evaporation. Lightweight humectants like glycerin draw water in, but without an emollient barrier like Vitamin E and Plant Squalane, that hydration evaporates within hours.

### The Power of Cold-Pressed Botanicals
Cold-pressed sweet almond oil and shea butter provide oleic and linoleic fatty acids that match your skin's natural lipid structure. This allows deep penetration without clogging pores or feeling sticky.`,
        coverImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
        author: 'Dr. Kavita Nair (Lead Formulator)',
        tags: ['Skincare Science', 'Vitamin E', 'Hydration Guide'],
        published: true
      },
      {
        title: 'How to Build an Evening Body Ritual for Calmer Sleep and Radiant Morning Skin',
        slug: 'evening-body-ritual-calm-sleep',
        excerpt: 'Simple steps to transform your night bath into an aromatherapeutic sanctuary that repairs and replenishes.',
        content: `Your skin does its heavy-duty cellular repair while you sleep. Combining warm hydrotherapy with lavender botanicals and nutrient-dense body milk creates the optimal conditions for recovery.

1. **Warm Shower or Bath**: Opens pores and relaxes tight shoulder muscles.
2. **Apply Lotion to Damp Skin**: Locks in three times more moisture than applying to dry skin.
3. **Inhale Calming Essential Botanicals**: French lavender has been clinically demonstrated to lower heart rates and prepare the body for deep REM sleep.`,
        coverImage: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=800&auto=format&fit=crop',
        author: 'Aura Botanica Wellness Team',
        tags: ['Night Ritual', 'Wellness', 'Aromatherapy'],
        published: true
      }
    ]);
    console.log('Blog posts created');

    // 8. Create FAQs
    await FAQ.create([
      {
        question: 'Are Aura Botanica products suitable for sensitive skin?',
        answer: 'Yes! All our formulations are dermatologically tested, pH-balanced (5.5), and free from parabens, mineral oils, phthalates, and harsh synthetic sulfates. If you have extreme sensitivities, we always recommend patch-testing on your inner wrist.',
        category: 'Products',
        order: 1
      },
      {
        question: 'Does the body lotion leave a greasy or sticky residue?',
        answer: 'Not at all. Our signature emulsions are engineered to absorb in under 30 seconds into cellular layers, leaving behind a smooth, silky touch so you can dress immediately without stains.',
        category: 'Products',
        order: 2
      },
      {
        question: 'What are your delivery timelines and shipping charges?',
        answer: 'We provide Free Standard Shipping on all orders over ₹450 across India. For orders below ₹450, standard shipping is ₹50. Orders are dispatched within 24–48 business hours and delivered within 2–5 business days.',
        category: 'Shipping',
        order: 3
      },
      {
        question: 'What is your return or replacement policy?',
        answer: 'We provide a hassle-free 7-day replacement or refund guarantee in the rare case of damaged, defective, or incorrect products received. Contact our customer care team via WhatsApp or email with your order ID.',
        category: 'Orders',
        order: 4
      },
      {
        question: 'Do you offer Cash on Delivery (COD)?',
        answer: 'Yes, Cash on Delivery is available across all serviceable pin codes in India, alongside secure online payments through UPI, Cards, NetBanking, and Wallets.',
        category: 'Payments',
        order: 5
      }
    ]);
    console.log('FAQs created');

    // 9. Create Website Settings
    await Setting.create({
      brandName: 'SmoothSelf',
      tagline: '',
      logoUrl: '',
      faviconUrl: '',
      announcementText: 'Free shipping order above ₹ 450',
      announcementActive: true,
      freeShippingThreshold: 450,
      standardShippingFee: 50,
      expressShippingFee: 100,
      contactEmail: 'support@smoothself.in',
      contactPhone: '+91 99604 42750',
      contactAddress: 'Mumbai, Maharashtra',
      currency: 'INR',
      currencySymbol: '₹',
      primaryColor: '#332d55',
      secondaryColor: '#9a84c8',
      accentColor: '#da3f3f',
      aboutUsTitle: 'The Purest Botanicals. The Softest Skin.',
      aboutUsText: 'SmoothSelf was created to bring mindfulness and botanical potency to everyday self-care. We craft ultra-nourishing, non-sticky personal care formulas infused with pure vanilla extract, unrefined shea butter, and restorative Vitamin E to reveal velvety soft skin every single day.',
      newsletterHeading: 'Let’s get in touch',
      newsletterSubheading: 'Sign up with your email to receive private member discounts, new formulation announcements, and mindful body care tips.'
    });
    console.log('Settings created');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedAll();
