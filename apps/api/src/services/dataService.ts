import { Request, Response } from 'express';
import axios from 'axios';
import { MockDataService } from '../mocks';
import { type CadastralParcel } from '@list-labs/shared-types';

const GIS_API_BASE_URL = 'https://gis-dev.listlabs.net/api';
const WMS_BASE_URL = 'https://ows.terrestris.de/osm/service';

// Service interface that both mock and real services implement
interface IDataService {
    health(req: Request, res: Response): Promise<void> | void | any;
    parcels(req: Request, res: Response): Promise<void> | void | any;
    parcelById(req: Request, res: Response): Promise<void> | void | any;
    featureById(req: Request, res: Response): Promise<void> | void | any;
    municipalities(req: Request, res: Response): Promise<void> | void | any;
    municipalityByNumber(req: Request, res: Response): Promise<void> | void | any;
    vectorTileCapabilities(req: Request, res: Response): Promise<void> | void | any;
    vectorTile(req: Request, res: Response): Promise<void> | void | any;
    wmsCapabilities(req: Request, res: Response): Promise<void> | void | any;
    wms(req: Request, res: Response): Promise<void> | void | any;
    parcelsGeoJSON?(req: Request, res: Response): Promise<void> | void | any;
}

// Real/Production service implementation
class RealDataService implements IDataService {
    async health(req: Request, res: Response) {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            mockMode: false
        });
    }

    async parcels(req: Request, res: Response) {
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

    async parcelById(req: Request, res: Response) {
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
                const status = error.response?.status || 500;
                res.status(status).json({
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

    async featureById(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const url = `${GIS_API_BASE_URL}/dkp/parcels/${id}/`;
            console.log(`Proxying feature (parcel) detail to: ${url}`);

            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'ListLabs-BFF/1.0'
                }
            });

            const parcel: CadastralParcel = response.data;

            // Transform to legacy feature format
            const feature = {
                id: parcel.id,
                area: parseFloat(parcel.properties.area) || 0,
                parcelNumber: parcel.properties.parcel_number,
                cadastralMunicipality: parcel.properties.cadastral_municipality,
                geometry: parcel.geometry
            };

            res.json(feature);
        } catch (error) {
            console.error(`Error fetching feature ${id}:`, error);

            if (axios.isAxiosError(error)) {
                const status = error.response?.status || 500;
                res.status(status).json({
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

    async municipalities(req: Request, res: Response) {
        try {
            const queryParams = new URLSearchParams(req.query as Record<string, string>);
            const url = `${GIS_API_BASE_URL}/dkp/municipalities/?${queryParams}`;
            console.log(`Proxying municipalities list to: ${url}`);

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

    async municipalityByNumber(req: Request, res: Response) {
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
                const status = error.response?.status || 500;
                res.status(status).json({
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

    async parcelsGeoJSON(req: Request, res: Response) {
        try {
            const queryParams = new URLSearchParams(req.query as Record<string, string>);
            const url = `${GIS_API_BASE_URL}/dkp/parcels/?${queryParams}`;
            console.log(`Proxying parcels GeoJSON to: ${url}`);

            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'ListLabs-BFF/1.0'
                }
            });

            // Return as GeoJSON FeatureCollection
            res.json(response.data);
        } catch (error) {
            console.error('Error fetching parcels GeoJSON:', error);

            if (axios.isAxiosError(error)) {
                res.status(error.response?.status || 500).json({
                    error: 'Failed to fetch parcels GeoJSON',
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

    async vectorTileCapabilities(req: Request, res: Response) {
        try {
            const url = 'https://gis-dev.listlabs.net/api/tegola/tegola-capabilities';
            console.log(`Proxying vector tile capabilities to: ${url}`);

            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'ListLabs-BFF/1.0'
                }
            });

            res.json(response.data);
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

    async vectorTile(req: Request, res: Response) {
        const { z, x, y } = req.params;

        try {
            const url = `https://gis-dev.listlabs.net/tegola/maps/cadastral_parcels/${z}/${x}/${y}.pbf`;
            console.log(`Proxying vector tile to: ${url}`);

            const response = await axios.get(url, {
                timeout: 10000,
                responseType: 'stream',
                headers: {
                    'User-Agent': 'ListLabs-BFF/1.0'
                }
            });

            res.set('Content-Type', 'application/vnd.mapbox-vector-tile');
            response.data.pipe(res);
        } catch (error) {
            console.error(`Error fetching vector tile ${z}/${x}/${y}:`, error);

            if (axios.isAxiosError(error)) {
                res.status(error.response?.status || 500).json({
                    error: 'Failed to fetch vector tile',
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

    async wmsCapabilities(req: Request, res: Response) {
        try {
            const url = `${WMS_BASE_URL}?service=WMS&request=GetCapabilities`;
            console.log(`Proxying WMS capabilities to: ${url}`);

            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'ListLabs-BFF/1.0'
                }
            });

            res.set('Content-Type', 'application/xml');
            res.send(response.data);
        } catch (error) {
            console.error('Error fetching WMS capabilities:', error);

            if (axios.isAxiosError(error)) {
                res.status(error.response?.status || 500).json({
                    error: 'Failed to fetch WMS capabilities',
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

    async wms(req: Request, res: Response) {
        try {
            const queryParams = new URLSearchParams(req.query as Record<string, string>);
            const url = `${WMS_BASE_URL}?${queryParams}`;
            console.log(`Proxying WMS request to: ${url}`);

            const response = await axios.get(url, {
                timeout: 15000,
                responseType: 'stream',
                headers: {
                    'User-Agent': 'ListLabs-BFF/1.0'
                }
            });

            res.set('Content-Type', response.headers['content-type'] || 'image/png');
            response.data.pipe(res);
        } catch (error) {
            console.error('Error fetching WMS image:', error);

            if (axios.isAxiosError(error)) {
                res.status(error.response?.status || 500).json({
                    error: 'Failed to fetch WMS image',
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
}

// Service factory that returns mock or real service based on configuration
class ServiceFactory {
    private static mockService = MockDataService;
    private static realService = new RealDataService();

    static getService(): IDataService {
        return MockDataService.isEnabled() ? this.mockService : this.realService;
    }
}

// Proxy-based DataService that automatically routes to mock or real service
export class DataService {
    private static getServiceProxy(): IDataService {
        return ServiceFactory.getService();
    }

    static async health(req: Request, res: Response) {
        return DataService.getServiceProxy().health(req, res);
    }

    static async parcels(req: Request, res: Response) {
        return DataService.getServiceProxy().parcels(req, res);
    }

    static async parcelById(req: Request, res: Response) {
        return DataService.getServiceProxy().parcelById(req, res);
    }

    static async featureById(req: Request, res: Response) {
        return DataService.getServiceProxy().featureById(req, res);
    }

    static async municipalities(req: Request, res: Response) {
        return DataService.getServiceProxy().municipalities(req, res);
    }

    static async municipalityByNumber(req: Request, res: Response) {
        return DataService.getServiceProxy().municipalityByNumber(req, res);
    }

    static async parcelsGeoJSON(req: Request, res: Response) {
        return DataService.getServiceProxy().parcelsGeoJSON?.(req, res);
    }

    static async vectorTileCapabilities(req: Request, res: Response) {
        return DataService.getServiceProxy().vectorTileCapabilities(req, res);
    }

    static async vectorTile(req: Request, res: Response) {
        return DataService.getServiceProxy().vectorTile(req, res);
    }

    static async wmsCapabilities(req: Request, res: Response) {
        return DataService.getServiceProxy().wmsCapabilities(req, res);
    }

    static async wms(req: Request, res: Response) {
        return DataService.getServiceProxy().wms(req, res);
    }
}