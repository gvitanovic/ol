#!/usr/bin/env node

/**
 * Test script to verify ListLabs vector tile fetching
 */

const axios = require('axios');

async function testListLabsTile(z, x, y) {
    const urls = [
        `https://gis-dev.listlabs.net/tegola/maps/cadastral_parcels/${z}/${x}/${y}.pbf`,
        `https://gis-dev.listlabs.net/tegola/maps/cadastral_municipalities/${z}/${x}/${y}.pbf`
    ];

    console.log(`🧪 Testing ListLabs tile: ${z}/${x}/${y}`);

    for (const url of urls) {
        try {
            console.log(`📡 Fetching: ${url}`);

            const response = await axios.get(url, {
                timeout: 10000,
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'ListLabs-BFF/1.0',
                    'Accept': 'application/x-protobuf'
                }
            });

            console.log(`✅ Success: ${response.status} ${response.statusText}`);
            console.log(`📊 Data size: ${response.data.byteLength} bytes`);
            console.log(`📋 Headers:`, response.headers['content-type']);

            if (response.data.byteLength > 0) {
                console.log(`🎯 Found data in: ${url}`);
                return true;
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }

    console.log(`⚠️ No data found for tile ${z}/${x}/${y}`);
    return false;
}

// Test different zoom levels and tile coordinates
async function runTests() {
    const testTiles = [
        [12, 2234, 1453], // Original request
        [10, 567, 362],   // Lower zoom
        [14, 8936, 5813], // Higher zoom
        [8, 141, 90]      // Much lower zoom
    ];

    console.log('🚀 Starting ListLabs vector tile tests...\n');

    for (const [z, x, y] of testTiles) {
        await testListLabsTile(z, x, y);
        console.log('---');
    }
}

runTests().catch(console.error);