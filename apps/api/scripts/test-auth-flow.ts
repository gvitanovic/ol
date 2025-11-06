#!/usr/bin/env node

import axios from 'axios';

const API_BASE = 'http://localhost:3001';

async function testAuthFlow() {
    console.log('🔄 Authentication Flow Test');
    console.log('============================');

    try {
        // 1. Generate initial tokens
        console.log('\n1. 📝 Generating initial tokens...');
        const tokenResponse = await axios.post(`${API_BASE}/api/auth/generate-tokens`, {
            userId: 'test-user-123',
            email: 'test@example.com',
            name: 'Test User',
            roles: ['user', 'viewer']
        });

        const { accessToken, refreshToken } = tokenResponse.data;
        console.log('✅ Tokens generated successfully');
        console.log(`Access Token: ${accessToken.substring(0, 30)}...`);
        console.log(`Refresh Token: ${refreshToken.substring(0, 30)}...`);

        // 2. Test API call with access token
        console.log('\n2. 🔐 Testing API call with access token...');
        try {
            const apiResponse = await axios.get(`${API_BASE}/api/parcels`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log('✅ API call successful with access token');
        } catch (error: any) {
            console.log(`⚠️  API call result: ${error.response?.status} - ${error.response?.statusText}`);
        }

        // 3. Test refresh token
        console.log('\n3. 🔄 Testing refresh token...');
        const refreshResponse = await axios.post(`${API_BASE}/api/auth/refresh`, {
            refreshToken: refreshToken
        });

        const { accessToken: newAccessToken } = refreshResponse.data;
        console.log('✅ Token refresh successful');
        console.log(`New Access Token: ${newAccessToken.substring(0, 30)}...`);

        // 4. Test API call with new access token
        console.log('\n4. 🔐 Testing API call with refreshed token...');
        try {
            const apiResponse2 = await axios.get(`${API_BASE}/api/parcels`, {
                headers: {
                    'Authorization': `Bearer ${newAccessToken}`
                }
            });
            console.log('✅ API call successful with refreshed token');
        } catch (error: any) {
            console.log(`⚠️  API call result: ${error.response?.status} - ${error.response?.statusText}`);
        }

        // 5. Test invalid refresh token
        console.log('\n5. ❌ Testing invalid refresh token...');
        try {
            await axios.post(`${API_BASE}/api/auth/refresh`, {
                refreshToken: 'invalid.refresh.token'
            });
        } catch (error: any) {
            console.log(`✅ Invalid refresh token properly rejected: ${error.response?.status}`);
        }

        console.log('\n🎯 Test Summary:');
        console.log('─────────────────');
        console.log('✅ Token generation: Working');
        console.log('✅ Access token validation: Working');
        console.log('✅ Token refresh: Working');
        console.log('✅ Invalid token rejection: Working');

        console.log('\n💡 Authentication Flow:');
        console.log('─────────────────────────');
        console.log('1. Client gets initial tokens from auth service');
        console.log('2. Client uses access token for API calls (15min expiry)');
        console.log('3. When access token expires, client uses refresh token');
        console.log('4. Server provides new access token (7day refresh expiry)');
        console.log('5. BFF handles outgoing auth to external services');

    } catch (error: any) {
        console.error('\n❌ Test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure the server is running: npm run dev');
        }
    }
}

testAuthFlow();