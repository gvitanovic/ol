import axios from 'axios';
import type { CadastralParcel, CadastralMunicipality } from '@list-labs/shared-types';

const BFF_BASE_URL = 'http://localhost:3001/api';

export class GISApiClient {
    private static instance: GISApiClient;
    private readonly baseUrl: string;

    private constructor(baseUrl: string = BFF_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    public static getInstance(): GISApiClient {
        if (!GISApiClient.instance) {
            GISApiClient.instance = new GISApiClient();
        }
        return GISApiClient.instance;
    }

    // Static convenience methods
    static async getFeatureById(id: string): Promise<CadastralParcel> {
        return GISApiClient.getInstance().getFeatureById(id)
    }

    static async getParcels(params?: Record<string, string>): Promise<CadastralParcel[]> {
        return GISApiClient.getInstance().getParcels(params);
    }

    static async getMunicipalities(params?: Record<string, string>): Promise<CadastralMunicipality[]> {
        return GISApiClient.getInstance().getMunicipalities(params);
    }

    static getVectorTileCapabilitiesUrl(): string {
        return GISApiClient.getInstance().getVectorTileCapabilitiesUrl();
    }

    static getVectorTileUrl(): string {
        return GISApiClient.getInstance().getVectorTileUrl();
    }

    static getWMSUrl(): string {
        return GISApiClient.getInstance().getWMSUrl();
    }

    // Instance methods
    async getFeatureById(id: string): Promise<CadastralParcel> {
        try {
            const response = await axios.get(`${this.baseUrl}/parcels/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching feature:', error);
            throw error;
        }
    }

    async getParcels(params?: Record<string, string>): Promise<CadastralParcel[]> {
        try {
            const queryString = params ? new URLSearchParams(params).toString() : '';
            const url = `${this.baseUrl}/parcels${queryString ? `?${queryString}` : ''}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching parcels:', error);
            throw error;
        }
    }

    async getMunicipalities(params?: Record<string, string>): Promise<CadastralMunicipality[]> {
        try {
            const queryString = params ? new URLSearchParams(params).toString() : '';
            const url = `${this.baseUrl}/municipalities${queryString ? `?${queryString}` : ''}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching municipalities:', error);
            throw error;
        }
    }

    getVectorTileCapabilitiesUrl(): string {
        // Use BFF proxy endpoint for vector tile capabilities
        return `${this.baseUrl}/vector-tiles/capabilities`;
    }

    getVectorTileUrl(): string {
        // Use BFF proxy endpoint for vector tiles
        return `${this.baseUrl}/vector-tiles/{z}/{x}/{y}`;
    }

    getWMSUrl(): string {
        return `${this.baseUrl}/wms`;
    }
}

// Export the singleton instance as default for convenience
export default GISApiClient;