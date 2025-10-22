// Test API Connection Script
// Open browser console and paste this to test

console.log('🔍 Testing API Connection...');

// Test 1: Backend Health Check
fetch('http://localhost:8080/api/listing/active')
  .then(res => {
    console.log('✅ Backend Status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('✅ Backend Response:', data);
    console.log(`📊 Found ${data.length} active listings`);
  })
  .catch(err => {
    console.error('❌ Backend Error:', err);
  });

// Test 2: Frontend API Integration
import { getActiveListings } from '@/lib/api';

async function testFrontendAPI() {
  try {
    console.log('🔍 Testing Frontend API Integration...');
    const response = await getActiveListings(0, 10);
    console.log('✅ Frontend API Response:', response);
    console.log(`📊 Found ${response.content?.length || 0} listings via frontend`);
  } catch (error) {
    console.error('❌ Frontend API Error:', error);
  }
}

// Run test
testFrontendAPI();

console.log(`
🎯 API Configuration:
- Backend: http://localhost:8080
- Frontend: http://localhost:3000
- API Base: http://localhost:8080/api

✅ If you see data above, API is connected!
❌ If you see errors, check:
  1. Backend is running (http://localhost:8080)
  2. CORS is configured correctly
  3. Network tab in DevTools for errors
`);
