/**
 * Mock service implementing OpenAPI specification endpoints
 * Based on /apps/api/openapi/index.json
 */

import { Request, Response } from 'express';
import {
    mockCadastralParcels,
    mockCadastralMunicipalities,
    findMockParcelById,
    findMockMunicipalityByNumber,
    getListLabsGeoJSON
} from './openApiData';
import {
    mockVectorTileHandler,
    mockTegolaCapabilitiesHandler
} from './vectorTiles';

export class OpenApiMockService {
    private static instance: OpenApiMockService;

    static getInstance(): OpenApiMockService {
        if (!OpenApiMockService.instance) {
            OpenApiMockService.instance = new OpenApiMockService();
        }
        return OpenApiMockService.instance;
    }

    /**
     * GET /dkp/parcels/ - List all cadastral parcels
     */
    static async listCadastralParcels(req: Request, res: Response) {
        console.log('🎭 Mock: Listing cadastral parcels');

        // TODO: Implement pagination with limit/offset from query params
        const { limit, offset } = req.query;

        let parcels = mockCadastralParcels;

        if (offset) {
            const offsetNum = parseInt(offset as string);
            parcels = parcels.slice(offsetNum);
        }

        if (limit) {
            const limitNum = parseInt(limit as string);
            parcels = parcels.slice(0, limitNum);
        }

        res.json(parcels);
    }

    /**
     * GET /dkp/parcels/{id}/ - Retrieve cadastral parcel by ID
     */
    static async getCadastralParcelById(req: Request, res: Response) {
        const { id } = req.params;
        console.log(`🎭 Mock: Getting cadastral parcel ${id}`);

        const parcel = findMockParcelById(id);

        if (!parcel) {
            return res.status(404).json({
                error: 'Parcel not found',
                message: `Cadastral parcel with ID ${id} not found`
            });
        }

        res.json(parcel);
    }

    /**
     * GET /dkp/municipalities/ - List all cadastral municipalities
     */
    static async listCadastralMunicipalities(req: Request, res: Response) {
        console.log('🎭 Mock: Listing cadastral municipalities');

        // TODO: Implement pagination with limit/offset from query params
        const { limit, offset } = req.query;

        let municipalities = mockCadastralMunicipalities;

        if (offset) {
            const offsetNum = parseInt(offset as string);
            municipalities = municipalities.slice(offsetNum);
        }

        if (limit) {
            const limitNum = parseInt(limit as string);
            municipalities = municipalities.slice(0, limitNum);
        }

        res.json(municipalities);
    }

    /**
     * GET /dkp/municipalities/{municipality_number}/ - Retrieve municipality by number
     */
    static async getCadastralMunicipalityByNumber(req: Request, res: Response) {
        const { municipality_number } = req.params;
        console.log(`🎭 Mock: Getting cadastral municipality ${municipality_number}`);

        const municipality = findMockMunicipalityByNumber(municipality_number);

        if (!municipality) {
            return res.status(404).json({
                error: 'Municipality not found',
                message: `Cadastral municipality with number ${municipality_number} not found`
            });
        }

        res.json(municipality);
    }

    /**
     * GET /tegola/tegola-capabilities - Tegola capabilities endpoint
     */
    static async getTegolaCapabilities(req: Request, res: Response) {
        return mockTegolaCapabilitiesHandler(req, res);
    }

    /**
     * Vector tile endpoints (not in OpenAPI but needed for map layer)
     */
    static async getVectorTile(req: Request, res: Response) {
        return await mockVectorTileHandler(req, res);
    }

    /**
     * GET /parcels/geojson - Get cadastral parcels as GeoJSON
     * Alternative to vector tiles for development
     */
    static getParcelsGeoJSON(req: Request, res: Response): void {
        console.log('[OpenApiMockService] Serving GeoJSON parcels');

        const geoJsonData = getListLabsGeoJSON();

        res.set({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });

        res.status(200).json(geoJsonData);
    }

    /**
     * Health check endpoint
     */
    static async health(req: Request, res: Response) {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            mockMode: true,
            message: 'OpenAPI Mock Service is running'
        });
    }
}