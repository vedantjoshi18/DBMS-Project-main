// Quick script to get your current IP address for MongoDB Atlas whitelist
const https = require('https');

console.log('🔍 Finding your current IP address...\n');

https.get('https://api.ipify.org?format=json', (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('✅ Your current IP address is:');
      console.log(`   ${result.ip}\n`);
      console.log('📋 Next steps:');
      console.log('   1. Go to: https://cloud.mongodb.com/v2#/security/network/whitelist');
      console.log('   2. Click "Add IP Address"');
      console.log('   3. Enter the IP address above');
      console.log('   4. Click "Confirm"');
      console.log('   5. Wait 1-2 minutes for changes to propagate');
      console.log('   6. Restart your backend server\n');
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.log('\n💡 You can also visit: https://www.whatismyip.com/');
    }
  });
}).on('error', (error) => {
  console.error('❌ Error fetching IP:', error.message);
  console.log('\n💡 You can also visit: https://www.whatismyip.com/');
});
