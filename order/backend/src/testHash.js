const bcrypt = require('bcrypt');

async function testHash() {
  const password = 'admin123';
  
  // Generate hash
  const hash = await bcrypt.hash(password, 10);
  console.log('\n=== Password Hash Testing ===');
  console.log('Password:', password);
  console.log('Generated hash:', hash);
  
  // Test the hash immediately
  const valid = await bcrypt.compare(password, hash);
  console.log('Hash verification test:', valid ? 'PASSED' : 'FAILED');
  
  // Copy this hash to init.sql
  console.log('\n=== Copy this to init.sql ===');
  console.log(`'${hash}'  -- password: admin123\n`);
}

testHash(); 