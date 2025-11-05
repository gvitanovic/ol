import { Request, Response } from 'express';
import { mockParcelsList, findParcelById } from './parcels';
import { mockMunicipalitiesList, findMunicipalityByNumber } from './municipalities';
import { mockVectorTileCapabilities, mockWMSCapabilities, mockWMSImage, mockVectorTile } from './tiles';
import { OpenApiMockService } from './openApiMockService';
import { getListLabsGeoJSON } from './openApiData';

// export const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';
export const USE_MOCK_DATA = false; // Enable mock mode for testfals

export class MockDataService {
    static isEnabled(): boolean {
        return USE_MOCK_DATA;
    }

    static health(req: Request, res: Response) {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            mockMode: true
        });
    }

    static parcels(req: Request, res: Response) {
        console.log('🎭 Using mock data for parcels list');
        res.json(mockParcelsList);
    }

    static parcelById(req: Request, res: Response) {
        const { id } = req.params;
        console.log(`🎭 Using mock data for parcel ${id}`);

        const parcel = findParcelById(id);
        if (!parcel) {
            return res.status(404).json({
                error: 'Parcel not found',
                message: `Parcel with ID ${id} not found`
            });
        }

        res.json(parcel);
    }

    static featureById(req: Request, res: Response) {
        const { id } = req.params;
        console.log(`🎭 Using mock data for feature ${id}`);

        const parcel = findParcelById(id);
        if (!parcel) {
            return res.status(404).json({
                error: 'Feature not found',
                message: `Feature with ID ${id} not found`
            });
        }

        const feature = {
            id: parcel.id,
            area: parseFloat(parcel.properties.area) || 0,
            parcelNumber: parcel.properties.parcel_number,
            cadastralMunicipality: parcel.properties.cadastral_municipality,
            geometry: parcel.geometry
        };

        res.json(feature);
    }

    static municipalities(req: Request, res: Response) {
        console.log('🎭 Using mock data for municipalities list');
        res.json(mockMunicipalitiesList);
    }

    static municipalityByNumber(req: Request, res: Response) {
        const { number } = req.params;
        console.log(`🎭 Using mock data for municipality ${number}`);

        const municipality = findMunicipalityByNumber(number);
        if (!municipality) {
            return res.status(404).json({
                error: 'Municipality not found',
                message: `Municipality with number ${number} not found`
            });
        }

        res.json(municipality);
    }

    static vectorTileCapabilities(req: Request, res: Response) {
        console.log('🎭 Using mock data for vector tile capabilities');
        res.json(mockVectorTileCapabilities);
    }

    static async vectorTile(req: Request, res: Response) {
        const { z, x, y } = req.params;
        console.log(`🎭 Using ListLabs data for vector tile ${z}/${x}/${y}`);

        return await OpenApiMockService.getVectorTile(req, res);
    }

    static wmsCapabilities(req: Request, res: Response) {
        console.log('🎭 Using mock data for WMS capabilities');
        res.set('Content-Type', 'application/xml');
        res.send(mockWMSCapabilities);
    }

    static wms(req: Request, res: Response) {
        console.log('🎭 Using mock data for WMS GetMap');
        res.set('Content-Type', 'image/png');
        res.send(mockWMSImage);
    }

    static parcelsGeoJSON(req: Request, res: Response) {
        console.log('🎭 Using mock data for parcels GeoJSON');

        res.json(getListLabsGeoJSON());
    }
}