import { type CadastralMunicipality } from '@list-labs/shared-types';

export const mockMunicipalities: CadastralMunicipality[] = [
    {
        municipality_number: "10000",
        area: "641.3",
        geom: "MULTIPOLYGON(((15.9000 45.7500, 16.1000 45.7500, 16.1000 45.9000, 15.9000 45.9000, 15.9000 45.7500)))"
    },
    {
        municipality_number: "21000",
        area: "79.4",
        geom: "MULTIPOLYGON(((16.4000 43.4500, 16.5000 43.4500, 16.5000 43.5500, 16.4000 43.5500, 16.4000 43.4500)))"
    },
    {
        municipality_number: "51000",
        area: "44.0",
        geom: "MULTIPOLYGON(((14.4000 45.3000, 14.5000 45.3000, 14.5000 45.4000, 14.4000 45.4000, 14.4000 45.3000)))"
    },
    {
        municipality_number: "31000",
        area: "169.3",
        geom: "MULTIPOLYGON(((18.6500 45.5000, 18.7500 45.5000, 18.7500 45.6000, 18.6500 45.6000, 18.6500 45.5000)))"
    }
];

export const mockMunicipalitiesList = {
    count: mockMunicipalities.length,
    next: null,
    previous: null,
    results: mockMunicipalities
};

export const findMunicipalityByNumber = (number: string): CadastralMunicipality | undefined => {
    return mockMunicipalities.find(municipality => municipality.municipality_number === number);
};