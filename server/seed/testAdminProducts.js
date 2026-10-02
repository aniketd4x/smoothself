require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { getSupabase, initSupabase } = require('../config/supabase');

async function testAdminProducts() {
  const sb = initSupabase() || getSupabase();
  
  // Simulate what getProducts({ isActive: false }) does
  let query = sb.from('products').select('*');
  
  // isActive: false means options.isActive !== false is FALSE, so NO filter applied
  // This is the logic: if (options.isActive !== false) { query = query.eq('is_active', true); }
  const isActive = false;
  if (isActive !== false) {
    query = query.eq('is_active', true);
    console.log('Applying is_active=true filter');
  } else {
    console.log('No is_active filter applied - should return ALL products');
  }
  
  query = query.order('created_at', { ascending: false });
  const { data, error } = await query;
  
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  
  console.log('Total products returned:', data.length);
  data.forEach(p => console.log(' -', p.name, '| active:', p.is_active, '| stock:', p.stock));
}

testAdminProducts().catch(console.error).finally(() => process.exit(0));
