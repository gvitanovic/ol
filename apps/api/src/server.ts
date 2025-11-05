import cors from 'cors';
import axios from 'axios';
import express from 'express';

import { type CadastralParcel } from '@list-labs/shared-types';

// move to env vars later
const PORT = process.env.PORT || 3001;
const GIS_API_BASE_URL = 'https://gis-dev.listlabs.net/api';
const WMS_BASE_URL = 'https://ows.terrestris.de/osm/service';

const app: express.Application = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/parcels', async (req, res) => {
    try {
        const queryParams = new URLSearchParams(req.query as Record<string, string>);
        const url = `${GIS_API_BASE_URL}/dkp/parcels/?${queryParams}`;
        console.log(`Proxying parcels list to: ${url}`);

        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'ListLabs-BFF/1.0'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching parcels list:', error);

        if (axios.isAxiosError(error)) {
            res.status(error.response?.status || 500).json({
                error: 'Failed to fetch parcels list',
                message: error.message,
                details: error.response?.statusText
            });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                message: 'Unknown error occurred'
            });
        }
    }
});

app.get('/api/parcels/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const url = `${GIS_API_BASE_URL}/dkp/parcels/${id}/`;
        console.log(`Proxying parcel detail to: ${url}`);

        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'ListLabs-BFF/1.0'
            }
        });

        const parcel: CadastralParcel = response.data;
        res.json(parcel);
    } catch (error) {
        console.error(`Error fetching parcel ${id}:`, error);

        if (axios.isAxiosError(error)) {
            res.status(error.response?.status || 500).json({
                error: 'Failed to fetch parcel',
                message: error.message,
                details: error.response?.statusText
            });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                message: 'Unknown error occurred'
            });
        }
    }
});

app.get('/api/features/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const url = `${GIS_API_BASE_URL}/dkp/parcels/${id}/`;
        console.log(`Proxying feature (legacy) to: ${url}`);

        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'ListLabs-BFF/1.0'
            }
        });

        const parcel = response.data;
        const feature = {
            id: parcel.id,
            area: parcel.area || 0,
            parcelNumber: parcel.parcel_number,
            cadastralMunicipality: parcel.cadastral_municipality,
            geometry: parcel.geom
        };

        res.json(feature);
    } catch (error) {
        console.error(`Error fetching feature ${id}:`, error);

        if (axios.isAxiosError(error)) {
            res.status(error.response?.status || 500).json({
                error: 'Failed to fetch feature',
                message: error.message,
                details: error.response?.statusText
            });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                message: 'Unknown error occurred'
            });
        }
    }
});

app.get('/api/municipalities', async (req, res) => {
    try {
        const queryParams = new URLSearchParams(req.query as Record<string, string>);
        const url = `${GIS_API_BASE_URL}/dkp/municipalities/?${queryParams}`;
        console.log(`Proxying municipalities to: ${url}`);

        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'ListLabs-BFF/1.0'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching municipalities:', error);

        if (axios.isAxiosError(error)) {
            res.status(error.response?.status || 500).json({
                error: 'Failed to fetch municipalities',
                message: error.message,
                details: error.response?.statusText
            });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                message: 'Unknown error occurred'
            });
        }
    }
});

app.get('/api/municipalities/:number', async (req, res) => {
    const { number } = req.params;

    try {
        const url = `${GIS_API_BASE_URL}/dkp/municipalities/${number}/`;
        console.log(`Proxying municipality detail to: ${url}`);

        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'ListLabs-BFF/1.0'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching municipality ${number}:`, error);

        if (axios.isAxiosError(error)) {
            res.status(error.response?.status || 500).json({
                error: 'Failed to fetch municipality',
                message: error.message,
                details: error.response?.statusText
            });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                message: 'Unknown error occurred'
            });
        }
    }
});

app.get('/api/vector-tiles/capabilities', async (req, res) => {
    try {
        const url = `${GIS_API_BASE_URL}/tegola/tegola-capabilities`;
        console.log(`Proxying vector tile capabilities to: ${url}`);

        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'ListLabs-BFF/1.0'
            }
        });

        console.log('Vector tile capabilities response:', JSON.stringify(response.data, null, 2));

        // Forward the response
        res.set('Content-Type', response.headers['content-type'] || 'application/json');
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching vector tile capabilities:', error);

        if (axios.isAxiosError(error)) {
            res.status(error.response?.status || 500).json({
                error: 'Failed to fetch vector tile capabilities',
                message: error.message,
                details: error.response?.statusText
            });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                message: 'Unknown error occurred'
            });
        }
    }
});

app.get('/api/vector-tiles/:z/:x/:y', async (req, res) => {
    const { z, x, y } = req.params;

    console.log(`Received vector tile request: z=${z}, x=${x}, y=${y}`);

    const possibleUrls = [
        `https://gis-dev.listlabs.net/tegola/maps/cadastral_parcels/${z}/${x}/${y}.pbf`,
        `https://gis-dev.listlabs.net/tegola/maps/cadastral_municipalities/${z}/${x}/${y}.pbf`
    ];

    const abortController = new AbortController();

    for (const url of possibleUrls) {
        try {
            const response = await axios.get(url, {
                timeout: 5000,
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'ListLabs-BFF/1.0'
                },
                signal: abortController.signal
            });

            res.set('Content-Type', 'application/x-protobuf');
            res.send(response.data);
            abortController.abort();
            return;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.code !== 'ABORT_ERR' && !error.message.includes('aborted')) {
                    console.log(`Failed ${url}: ${error.response?.status} ${error.response?.statusText}`);
                }
            }
            if (abortController.signal.aborted) {
                return;
            }
        }
    }

    console.error(`All vector tile URLs failed for ${z}/${x}/${y}`);

    res.status(404).json({
        error: 'Vector tile not found',
        message: `No vector tiles found for ${z}/${x}/${y}`,
        attemptedUrls: possibleUrls
    });
});

app.get('/api/features/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const response = await axios.get(`${GIS_API_BASE_URL}/feature/${id}`, {
            timeout: 10000,
            headers: {
                'User-Agent': 'ListLabs-BFF/1.0'
            }
        });

        const feature: CadastralParcel = response.data;
        res.json(feature);
    } catch (error) {
        console.error(`Error fetching feature ${id}:`, error);

        if (axios.isAxiosError(error)) {
            res.status(error.response?.status || 500).json({
                error: 'Failed to fetch feature',
                message: error.message,
                details: error.response?.statusText
            });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                message: 'Unknown error occurred'
            });
        }
    }
});

app.get('/api/wms/capabilities', async (req, res) => {
    try {
        const response = await axios.get(`${WMS_BASE_URL}?service=WMS&request=GetCapabilities`, {
            timeout: 10000,
            headers: {
                'User-Agent': 'ListLabs-BFF/1.0'
            }
        });

        res.set('Content-Type', response.headers['content-type'] || 'application/xml');
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching WMS capabilities:', error);

        if (axios.isAxiosError(error)) {
            res.status(error.response?.status || 500).json({
                error: 'Failed to fetch WMS capabilities',
                message: error.message
            });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                message: 'Unknown error occurred'
            });
        }
    }
});

app.get('/api/wms', async (req, res) => {
    try {
        const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
        console.log(`Proxying WMS request to: ${WMS_BASE_URL}?${queryString}`);
        const response = await axios.get(`${WMS_BASE_URL}?${queryString}`, {
            timeout: 10000,
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'ListLabs-BFF/1.0'
            }
        });

        res.set('Content-Type', response.headers['content-type'] || 'image/png');
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching WMS data:', error);

        if (axios.isAxiosError(error)) {
            res.status(error.response?.status || 500).json({
                error: 'Failed to fetch WMS data',
                message: error.message
            });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                message: 'Unknown error occurred'
            });
        }
    }
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
        error: 'Not found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

app.listen(PORT, () => {
    console.log(`BFF API server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Vector tiles: http://localhost:${PORT}/api/vector-tiles/capabilities`);
    console.log(`Image tiles: http://localhost:${PORT}/api/wms/capabilities`);
});

export default app;