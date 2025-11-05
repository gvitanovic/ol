/**
 * Utility to calculate tile coordinates for debugging
 */

/**
 * Convert longitude/latitude to tile coordinates
 * Based on standard Web Mercator projection
 */
export function lonLatToTile(lon: number, lat: number, zoom: number): { x: number, y: number, z: number } {
    const n = Math.pow(2, zoom);
    const x = Math.floor((lon + 180) / 360 * n);
    const lat_rad = lat * Math.PI / 180;
    const y = Math.floor((1 - Math.asinh(Math.tan(lat_rad)) / Math.PI) / 2 * n);

    return { x, y, z: zoom };
}

/**
 * Convert tile coordinates back to bounding box
 */
export function tileToBBox(x: number, y: number, z: number): { minLon: number, minLat: number, maxLon: number, maxLat: number } {
    const n = Math.pow(2, z);
    const minLon = x / n * 360 - 180;
    const maxLon = (x + 1) / n * 360 - 180;

    const minLat_rad = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n)));
    const maxLat_rad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
    const minLat = minLat_rad * 180 / Math.PI;
    const maxLat = maxLat_rad * 180 / Math.PI;

    return { minLon, minLat, maxLon, maxLat };
}

/**
 * Check if a parcel intersects with a tile bounding box
 */
export function parcelIntersectsTile(parcelCoords: number[][][][], tileBBox: { minLon: number, minLat: number, maxLon: number, maxLat: number }): boolean {
    // Get the first polygon of the MultiPolygon - this is number[][]
    const ring: number[][] = parcelCoords[0][0]; // This gets us number[]

    // Calculate parcel bounding box
    const lons: number[] = [];
    const lats: number[] = [];

    // Extract coordinates properly
    for (let i = 0; i < ring.length; i++) {
        if (Array.isArray(ring[i]) && ring[i].length >= 2) {
            lons.push((ring[i] as number[])[0]);
            lats.push((ring[i] as number[])[1]);
        }
    }

    if (lons.length === 0 || lats.length === 0) {
        return false;
    }

    const parcelMinLon = Math.min(...lons);
    const parcelMaxLon = Math.max(...lons);
    const parcelMinLat = Math.min(...lats);
    const parcelMaxLat = Math.max(...lats);

    // Check if bounding boxes intersect
    return !(parcelMaxLon < tileBBox.minLon || parcelMinLon > tileBBox.maxLon ||
        parcelMaxLat < tileBBox.minLat || parcelMinLat > tileBBox.maxLat);
}