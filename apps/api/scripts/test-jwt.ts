#!/usr/bin/env node

import { JwtUtils } from '../src/utils/jwtUtils.js';

async function runJwtTest() {
    const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-development';

    console.log('🔐 JWT Authentication Test');
    console.log('==========================');

    const tokens = JwtUtils.generateExampleTokens(JWT_SECRET);

    console.log('\n📝 Generated Test Tokens:');
    console.log('─────────────────────────');

    Object.entries(tokens).forEach(([userType, token]) => {
        console.log(`\n${userType.toUpperCase()}:`);
        console.log(`Token: ${token}`);

        const decoded = JwtUtils.decodeToken(token);
        console.log(`User: ${decoded.name} (${decoded.email})`);
        console.log(`Roles: ${decoded.roles.join(', ')}`);
        console.log(`Expires: ${new Date(decoded.exp * 1000).toISOString()}`);
    });

    console.log('\n🧪 Test Commands:');
    console.log('─────────────────');
    console.log('\n1. Test with valid JWT:');
    console.log(`curl -H "Authorization: Bearer ${tokens.regularUser}" \\`);
    console.log('     http://localhost:3001/api/parcels');

    console.log('\n2. Test with invalid token:');
    console.log('curl -H "Authorization: Bearer invalid.jwt.token" \\');
    console.log('     http://localhost:3001/api/parcels');

    console.log('\n3. Test without token (should fail):');
    console.log('curl http://localhost:3001/api/parcels');

    console.log('\n4. Test health endpoint (should work without auth):');
    console.log('curl http://localhost:3001/health');

    console.log('\n5. Test with basic token (fallback auth):');
    console.log('curl -H "Authorization: Bearer simple-basic-token" \\');
    console.log('     http://localhost:3001/api/parcels');

    console.log('\n💡 Configuration:');
    console.log('─────────────────');
    console.log('Set ENABLE_JWT_VALIDATION=true to enable JWT validation');
    console.log('Set ENABLE_JWT_VALIDATION=false to use basic token auth');
    console.log(`Current JWT_SECRET: ${JWT_SECRET.substring(0, 10)}...`);

    console.log('\n✅ Ready to test! Start your server with: npm run dev');
}

runJwtTest().catch(console.error);