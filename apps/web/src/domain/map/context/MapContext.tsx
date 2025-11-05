import { Map } from 'ol';
import View from 'ol/View';
import { OSM } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import { createContext, useContext, type ReactNode, useState, useEffect } from 'react';

const POSITIONS = {
    extent: {
        cro: {
            southwest: fromLonLat([13.2, 42.1]),
            northeast: fromLonLat([19.4, 46.9]),
        }
    },
    locations: {
        varazdinskeToplice: fromLonLat([16.4228, 46.2106]),
    }
}

const CROATIA_EXTENT = [
    ...POSITIONS.extent.cro.southwest,
    ...POSITIONS.extent.cro.northeast
];

interface MapContextType {
    map: Map | null;
    setMap: (map: Map) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
    const [map, setMap] = useState<Map | null>(null);

    useEffect(() => {
        const initialMap = new Map({
            view: new View({
                center: POSITIONS.locations.varazdinskeToplice,
                zoom: 13,
                extent: CROATIA_EXTENT,
            }),
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
        });

        setMap(initialMap);

        return () => {
            console.log('🧹 Cleaning up map...');
            if (initialMap) {
                initialMap.setTarget(undefined);
            }
        };
    }, []);

    return (
        <MapContext.Provider value={{ map, setMap }}>
            {children}
        </MapContext.Provider>
    );
};

export const useMap = () => {
    const context = useContext(MapContext);
    if (context === undefined) {
        throw new Error('useMap must be used within a MapProvider');
    }
    return context;
};

export default MapContext;