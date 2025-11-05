export interface CadastralParcel {
    id: number;
    type: string;
    geometry: Geometry;
    properties: Properties;
}

interface Properties {
    parcel_number: string;
    area: string;
    cadastral_municipality: string;
}

interface Geometry {
    type: string;
    coordinates: number[][][][];
}
export interface CadastralMunicipality {
    municipality_number: string;
    area?: string;
    geom?: string;
}

export interface MapFeature {
    id: string;
    type: 'cadastral_parcel' | 'other';
    geometry: any;
    properties: Record<string, any>;
}

export interface MapLayer {
    id: string;
    name: string;
    type: 'vector' | 'wms' | 'osm';
    visible: boolean;
    zIndex: number;
}