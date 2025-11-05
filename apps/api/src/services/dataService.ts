import { Request, Response } from 'express';
import axios from 'axios';
import { MockDataService } from '../mocks';
import { type CadastralParcel } from '@list-labs/shared-types';

const GIS_API_BASE_URL = 'https://gis-dev.listlabs.net/api';
const WMS_BASE_URL = 'https://ows.terrestris.de/osm/service';

export class DataService {
    // Health endpoint
    static async health(req: Request, res: Response) {
        if (MockDataService.isEnabled()) {
            return MockDataService.health(req, res);
        }

        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            mockMode: false
        });
    }

    // Parcels endpoints
    static async parcels(req: Request, res: Response) {
        if (MockDataService.isEnabled()) {
            return MockDataService.parcels(req, res);
        }

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
    }

    static async parcelById(req: Request, res: Response) {
        if (MockDataService.isEnabled()) {
            return MockDataService.parcelById(req, res);
        }

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
    }

    // Features endpoint (legacy)
    static async featureById(req: Request, res: Response) {
        if (MockDataService.isEnabled()) {
            return MockDataService.featureById(req, res);
        }

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
    }

    // Municipalities endpoints
    static async municipalities(req: Request, res: Response) {
        if (MockDataService.isEnabled()) {
            return MockDataService.municipalities(req, res);
        }

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
    }

    static async municipalityByNumber(req: Request, res: Response) {
        if (MockDataService.isEnabled()) {
            return MockDataService.municipalityByNumber(req, res);
        }

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
    }

    // Vector tiles endpoints
    static async vectorTileCapabilities(req: Request, res: Response) {
        if (MockDataService.isEnabled()) {
            return MockDataService.vectorTileCapabilities(req, res);
        }

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
    }

    static async vectorTile(req: Request, res: Response) {
        if (MockDataService.isEnabled()) {
            return MockDataService.vectorTile(req, res);
        }

        const { z, x, y } = req.params;

        console.log(`Received vector tile request: z=${z}, x=${x}, y=${y}`);

        const possibleUrls = [
            `https://gis-dev.listlabs.net/tegola/maps/cadastral_parcels/${z}/${x}/${y}.pbf`,
            `https://gis-dev.listlabs.net/tegola/maps/cadastral_municipalities/${z}/${x}/${y}.pbf`
        ];

        const promises = possibleUrls.map((url, index) =>
            axios.get(url, {
                timeout: 5000,
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'ListLabs-BFF/1.0'
                }
            }).then(response => ({ success: true, response, url, index }))
                .catch(error => ({ success: false, error, url, index }))
        );

        try {
            const results = await Promise.allSettled(promises);

            for (const result of results) {
                if (result.status === 'fulfilled' && result.value.success && 'response' in result.value) {
                    res.set('Content-Type', 'application/x-protobuf');
                    res.send(result.value.response.data);
                    return;
                }
            }

            results.forEach((result) => {
                if (result.status === 'rejected') {
                    console.log(`Failed ${possibleUrls[0]}: Promise rejected - ${result.reason}`);
                } else if (!result.value.success && 'error' in result.value) {
                    const axiosError = result.value.error;
                    if (axios.isAxiosError(axiosError)) {
                        console.log(`Failed ${result.value.url}: ${axiosError.response?.status} ${axiosError.response?.statusText}`);
                    } else {
                        console.log(`Failed ${result.value.url}: ${axiosError}`);
                    }
                }
            });

            console.error(`All vector tile URLs failed for ${z}/${x}/${y}`);

            res.status(404).json({
                error: 'Vector tile not found',
                message: `No vector tiles found for ${z}/${x}/${y}`,
                attemptedUrls: possibleUrls
            });
        } catch (error) {
            console.error(`Unexpected error in vector tiles endpoint:`, error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to fetch vector tiles'
            });
        }
    }

    // WMS endpoints
    static async wmsCapabilities(req: Request, res: Response) {
        if (MockDataService.isEnabled()) {
            return MockDataService.wmsCapabilities(req, res);
        }

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
    }

    static async wms(req: Request, res: Response) {
        if (MockDataService.isEnabled()) {
            return MockDataService.wms(req, res);
        }

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
    }
}