#!/usr/bin/env node

import jwt from 'jsonwebtoken';

const jwtSecret = 'test-secret-key';

console.log('🔐 Direct JWT Library Test');
console.log('==========================');

try {
    // Test JWT signing
    const payload = {
        sub: 'test-user',
        email: 'test@example.com',
        iat: Math.floor(Date.now() / 1000),
        iss: 'gis-bff',
        aud: 'gis-client'
    };

    console.log('1. Testing JWT signing...');
    const token = jwt.sign(payload, jwtSecret, {
        expiresIn: '15m',
        algorithm: 'HS256'
    } as any);

    console.log('✅ JWT signing successful');
    console.log(`Token: ${token.substring(0, 50)}...`);

    // Test JWT verification
    console.log('\n2. Testing JWT verification...');
    const decoded = jwt.verify(token, jwtSecret);
    console.log('✅ JWT verification successful');
    console.log('Decoded payload:', decoded);

    console.log('\n3. Testing token decode (no verification)...');
    const decodedNoVerify = jwt.decode(token);
    console.log('✅ JWT decode successful');
    console.log('Decoded (no verify):', decodedNoVerify);

    console.log('\n🎉 All JWT operations working correctly!');

} catch (error) {
    console.error('❌ JWT test failed:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
}