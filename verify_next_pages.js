const http = require('http');

const pages = [
  '/',
  '/shop',
  '/cart',
  '/checkout',
  '/account',
  '/wishlist',
  '/about',
  '/contact',
  '/faq',
  '/blog',
  '/track-order',
  '/privacy-policy',
  '/refund-policy',
  '/shipping-policy',
  '/terms-of-service',
  '/admin/login',
  '/admin',
  '/admin/products',
  '/admin/categories',
  '/admin/orders',
  '/admin/customers',
  '/admin/coupons',
  '/admin/reviews',
  '/admin/banners',
  '/admin/blog',
  '/admin/faqs',
  '/admin/settings'
];

function fetchPage(path) {
  return new Promise((resolve) => {
    http.get({ hostname: 'localhost', port: 3000, path }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ path, status: res.statusCode, length: data.length });
      });
    }).on('error', (err) => {
      resolve({ path, status: 'ERROR', error: err.message });
    });
  });
}

async function verifyAll() {
  console.log(`🔍 Checking ${pages.length} Next.js App Router Pages on http://localhost:3000...\n`);
  let passed = 0;
  for (const p of pages) {
    const res = await fetchPage(p);
    const ok = res.status === 200;
    if (ok) passed++;
    console.log(`${ok ? '✅' : '❌'} ${p.padEnd(25)} -> Status ${res.status} (${res.length} bytes)`);
  }
  console.log(`\n🎉 Result: ${passed}/${pages.length} Pages Verified Successfully!`);
  if (passed === pages.length) process.exit(0);
  else process.exit(1);
}

verifyAll();
