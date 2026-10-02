require('dotenv').config();
const { getSupabase, initSupabase } = require('../config/supabase');

async function verify() {
  const sb = initSupabase() || getSupabase();
  const { data, error } = await sb.from('products').select('id, name, slug, price, compare_at_price, stock, is_active, sku, category_name').order('created_at', { ascending: true });
  if (error) { console.error('Error:', error.message); return; }
  console.log('Total products:', data.length);
  data.forEach((p, i) => {
    console.log('\n[' + (i+1) + '] ' + p.name);
    console.log('    slug:     ' + p.slug);
    console.log('    sku:      ' + p.sku);
    console.log('    price:    Rs.' + p.price + ' | mrp: Rs.' + p.compare_at_price);
    console.log('    stock:    ' + p.stock + ' | active: ' + p.is_active);
    console.log('    category: ' + p.category_name);
  });
}
verify().catch(console.error).finally(() => process.exit(0));
