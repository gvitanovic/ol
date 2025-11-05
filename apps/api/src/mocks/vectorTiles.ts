/**
 * Vector Tile Service - Fetches real data from ListLabs and caches locally
 */

import { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache directory for vector tiles
const CACHE_DIR = path.join(__dirname, 'data', 'vector-tiles');

/**
 * Ensure cache directory exists
 */
function ensureCacheDir() {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
        console.log(`📁 Created vector tile cache directory: ${CACHE_DIR}`);
    }
}

/**
 * Get cache file path for a tile
 */
function getCacheFilePath(z: number, x: number, y: number): string {
    return path.join(CACHE_DIR, `${z}-${x}-${y}.pbf`);
}

/**
 * Fetch vector tile from ListLabs server
 */
async function fetchVectorTileFromListLabs(z: number, x: number, y: number): Promise<Buffer> {
    const urls = [
        `https://gis-dev.listlabs.net/tegola/maps/cadastral_parcels/${z}/${x}/${y}.pbf`,
        `https://gis-dev.listlabs.net/tegola/maps/cadastral_municipalities/${z}/${x}/${y}.pbf`
    ];

    console.log(`🌐 Fetching vector tile from ListLabs: ${z}/${x}/${y}`);

    for (const url of urls) {
        try {
            console.log(`📡 Trying: ${url}`);

            const response = await axios.get(url, {
                timeout: 5000, // Reduced timeout from 10s to 5s
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'ListLabs-BFF/1.0',
                    'Accept': 'application/x-protobuf'
                },
                validateStatus: (status) => status === 200 // Only accept 200 status
            });

            if (response.data && response.data.byteLength > 0) {
                const buffer = Buffer.from(response.data);
                console.log(`✅ Fetched vector tile from ${url}, size: ${buffer.length} bytes`);
                return buffer;
            }
        } catch (error) {
            console.log(`❌ Failed to fetch from ${url}:`, error instanceof Error ? error.message : 'Unknown error');
        }
    }

    throw new Error(`No data available for tile ${z}/${x}/${y} from ListLabs`);
}

/**
 * Generate or fetch vector tile with caching
 */
export const generateMockVectorTile = async (z: number, x: number, y: number): Promise<Buffer> => {
    console.log(`🗺️ Processing vector tile request: ${z}/${x}/${y}`);

    ensureCacheDir();
    const cacheFile = getCacheFilePath(z, x, y);

    try {
        // Check if cached file exists
        if (fs.existsSync(cacheFile)) {
            const cached = fs.readFileSync(cacheFile);
            if (cached.length > 0) {
                console.log(`💾 Using cached vector tile: ${z}/${x}/${y}, size: ${cached.length} bytes`);
                return cached;
            }
        }

        // Fetch from ListLabs
        const tileBuffer = await fetchVectorTileFromListLabs(z, x, y);

        // Cache the result
        fs.writeFileSync(cacheFile, tileBuffer);
        console.log(`💾 Cached vector tile: ${cacheFile}`);

        return tileBuffer;

    } catch (error) {
        console.error(`❌ Error processing vector tile ${z}/${x}/${y}:`, error);

        // Return empty buffer as fallback
        const emptyBuffer = Buffer.alloc(0);
        console.log(`⚠️ Returning empty buffer for ${z}/${x}/${y}`);
        return emptyBuffer;
    }
};

/**
 * Vector tile endpoint handler with ListLabs integration
 */
export const mockVectorTileHandler = async (req: Request, res: Response) => {
    const { z, x, y } = req.params;
    const zNum = parseInt(z);
    const xNum = parseInt(x);
    const yNum = parseInt(y);

    console.log(`🎭 Serving vector tile from ListLabs: ${z}/${x}/${y}`);

    try {
        // Add a timeout wrapper to prevent hanging
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 8000);
        });

        // Fetch the actual vector tile data with timeout
        console.log(`🔍 Fetching vector tile data for ${z}/${x}/${y}`);

        const tileBuffer = await Promise.race([
            generateMockVectorTile(zNum, xNum, yNum),
            timeoutPromise
        ]);

        console.log(`📤 Sending vector tile for ${z}/${x}/${y}, size: ${tileBuffer.length} bytes`);

        // Set appropriate headers for vector tiles
        res.set({
            'Content-Type': 'application/vnd.mapbox-vector-tile',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
            'Content-Length': tileBuffer.length.toString()
        });

        // Send the tile data
        if (tileBuffer.length > 0) {
            res.status(200).send(tileBuffer);
            console.log(`✅ Successfully sent vector tile for ${z}/${x}/${y}`);
        } else {
            res.status(204).end();
            console.log(`⚠️ Sent empty tile for ${z}/${x}/${y} (no data available)`);
        }

    } catch (error) {
        console.error(`❌ Error serving vector tile ${z}/${x}/${y}:`, error);

        // Return empty tile on error to prevent hanging
        res.set({
            'Content-Type': 'application/vnd.mapbox-vector-tile',
            'Cache-Control': 'public, max-age=300', // Shorter cache for errors
            'Access-Control-Allow-Origin': '*'
        });

        res.status(204).end();
        console.log(`⚠️ Returned empty tile due to error for ${z}/${x}/${y}`);
    }
};/**
 * Mock tegola capabilities response
 */
export const mockTegolaCapabilities = {
    "tegola": {
        "capabilities": {
            "maps": [
                {
                    "name": "cadastral_parcels",
                    "layers": [
                        {
                            "name": "cadastral_parcels",
                            "minzoom": 0,
                            "maxzoom": 20
                        }
                    ]
                },
                {
                    "name": "cadastral_municipalities",
                    "layers": [
                        {
                            "name": "cadastral_municipalities",
                            "minzoom": 0,
                            "maxzoom": 20
                        }
                    ]
                }
            ]
        }
    }
};

/**
 * Mock tegola capabilities endpoint handler
 */
export const mockTegolaCapabilitiesHandler = (req: Request, res: Response) => {
    console.log('🎭 Serving mock tegola capabilities');

    res.set({
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
    });

    res.json(mockTegolaCapabilities);
};