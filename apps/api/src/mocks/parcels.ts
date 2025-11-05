import { type CadastralParcel } from '@list-labs/shared-types';

export const mockParcels: CadastralParcel[] = [
    {
        id: 1001,
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: [[[
                [15.9819, 45.8150],
                [15.9825, 45.8150],
                [15.9825, 45.8155],
                [15.9819, 45.8155],
                [15.9819, 45.8150]
            ]]]
        },
        properties: {
            parcel_number: "123/45",
            cadastral_municipality: "Zagreb",
            area: "1500.5"
        }
    },
    {
        id: 1002,
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: [[[
                [15.9830, 45.8160],
                [15.9840, 45.8160],
                [15.9840, 45.8170],
                [15.9830, 45.8170],
                [15.9830, 45.8160]
            ]]]
        },
        properties: {
            parcel_number: "124/46",
            cadastral_municipality: "Zagreb",
            area: "2300.8"
        }
    },
    {
        id: 1003,
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: [[[
                [16.4395, 43.5081],
                [16.4405, 43.5081],
                [16.4405, 43.5091],
                [16.4395, 43.5091],
                [16.4395, 43.5081]
            ]]]
        },
        properties: {
            parcel_number: "125/47",
            cadastral_municipality: "Split",
            area: "980.2"
        }
    },
    {
        id: 1004,
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: [[[
                [14.4425, 45.3271],
                [14.4435, 45.3271],
                [14.4435, 45.3281],
                [14.4425, 45.3281],
                [14.4425, 45.3271]
            ]]]
        },
        properties: {
            parcel_number: "126/48",
            cadastral_municipality: "Rijeka",
            area: "1750.3"
        }
    },
    {
        id: 1005,
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: [[[
                [18.6955, 45.5547],
                [18.6965, 45.5547],
                [18.6965, 45.5557],
                [18.6955, 45.5557],
                [18.6955, 45.5547]
            ]]]
        },
        properties: {
            parcel_number: "127/49",
            cadastral_municipality: "Osijek",
            area: "3200.7"
        }
    }
];

export const mockParcelsList = {
    count: mockParcels.length,
    next: null,
    previous: null,
    results: mockParcels
};

export const findParcelById = (id: string | number): CadastralParcel | undefined => {
    return mockParcels.find(parcel => parcel.id === parseInt(id.toString()));
};