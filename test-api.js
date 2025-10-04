// test-api.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';

async function testAPI() {
    try {
        console.log('Testing API endpoints...\n');

        // Test Registration
        console.log('1. Testing Registration...');
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
            email: 'testuser@example.com',
            password: 'password123'
        });
        console.log('✓ Registration successful:', registerResponse.data);

        // Test Login
        console.log('\n2. Testing Login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'testuser@example.com',
            password: 'password123'
        });
        authToken = loginResponse.data.token;
        console.log('✓ Login successful:', loginResponse.data);

        // Test Get User Profile
        console.log('\n3. Testing Get User Profile...');
        const profileResponse = await axios.get(`${BASE_URL}/users/1`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        console.log('✓ Profile retrieved:', profileResponse.data);

        // Test Update User Profile
        console.log('\n4. Testing Update User Profile...');
        const updateResponse = await axios.put(`${BASE_URL}/users/1`, {
            email: 'updated@example.com'
        }, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        console.log('✓ Profile updated:', updateResponse.data);

        console.log('\n🎉 All tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run tests
testAPI();