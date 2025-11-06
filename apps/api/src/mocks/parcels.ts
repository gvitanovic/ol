import { type CadastralParcel } from '@gis-tools/shared-types';
import { mockCadastralParcels } from './openApiData';

// Use the real ListLabs data from openApiData.ts instead of static mock data
export const mockParcels: CadastralParcel[] = mockCadastralParcels;

export const mockParcelsList = {
    count: mockParcels.length,
    next: null,
    previous: null,
    results: mockParcels
};

export const findParcelById = (id: string | number): CadastralParcel | undefined => {
    return mockParcels.find(parcel => parcel.id === parseInt(id.toString()));
};