/**
 * Debug Environment Variables
 * Temporary script untuk check environment di Zeabur container
 */

console.log('🔍 Environment Variables Debug');
console.log('==============================');

// Core environment variables
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('PORT:', process.env.PORT || 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET (hidden)' : 'NOT SET');

// CORS configuration
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');
console.log('FRONTEND_URL_SECONDARY:', process.env.FRONTEND_URL_SECONDARY || 'NOT SET');

// Database (if set)
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (hidden)' : 'NOT SET');

// All environment variables (be careful with secrets)
console.log('\n📋 All Environment Variables:');
console.log('==============================');

Object.keys(process.env)
  .filter(key => !key.includes('SECRET') && !key.includes('KEY') && !key.includes('PASSWORD'))
  .sort()
  .forEach(key => {
    console.log(`${key}:`, process.env[key]);
  });

console.log('\n🔒 Secret Variables (count only):');
console.log('================================');
const secretKeys = Object.keys(process.env).filter(key => 
  key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD')
);
console.log(`Found ${secretKeys.length} secret variables:`, secretKeys.map(k => `${k}: SET`));

console.log('\n✅ Debug completed');