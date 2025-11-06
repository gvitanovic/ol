import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import { useRef, useState, useCallback } from 'react';

import { GISApiClient } from '@list-labs/api-client';

export const useCorineLandCover = () => {
    const [isVisible, setIsVisible] = useState(false);
    const corineLayerRef = useRef<TileLayer<TileWMS> | null>(null);

    const createCorineLayer = () => {
        const corineSource = new TileWMS({
            url: GISApiClient.getWMSUrl(),
            params: {
                'LAYERS': 'OSM-WMS',
                'FORMAT': 'image/png',
                'TRANSPARENT': true,
                'VERSION': '1.1.1',
                'SRS': 'EPSG:3857'
            },
            serverType: 'geoserver',
            crossOrigin: 'anonymous'
        });

        const corineLayer = new TileLayer({
            source: corineSource,
            visible: false,
            opacity: 0.8,
            minZoom: 6,
            maxZoom: 18,
            className: 'land-cover-layer'
        });

        corineSource.on('tileloaderror', (event: any) => {
            console.error('WMS tile load error:', event);
            console.error('Error details:', event.tile);
        });

        corineLayerRef.current = corineLayer;

        setIsVisible(false);

        return corineLayer;
    };

    const getCorineLayer = useCallback(() => {
        if (!corineLayerRef.current) {
            return createCorineLayer();
        }
        return corineLayerRef.current;
    }, []);

    const getVisibility = useCallback(() => {
        return corineLayerRef.current ? corineLayerRef.current.getVisible() : false;
    }, []);

    const setVisibility = useCallback((visible: boolean) => {
        if (corineLayerRef.current) {
            setIsVisible(visible);
            corineLayerRef.current.setVisible(visible);

            if (visible) {
                // Refresh the layer when making it visible
                const source = corineLayerRef.current.getSource();
                if (source) {
                    source.refresh();
                }
            }
        } else {
            console.warn('Cannot set visibility: corineLayerRef.current is null');
        }
    }, []);

    const refreshLayer = useCallback(() => {
        if (corineLayerRef.current) {
            corineLayerRef.current.getSource()?.refresh();
        }
    }, []);

    const toggleVisibility = useCallback(() => {
        const newVisibility = !isVisible;
        setVisibility(newVisibility);
    }, [isVisible, setVisibility]);

    const cleanup = useCallback(() => {
        if (corineLayerRef.current) {
            corineLayerRef.current.dispose();
            corineLayerRef.current = null;
        }
    }, []);

    return {
        corineLayerRef,
        getCorineLayer,
        getVisibility,
        setVisibility,
        toggleVisibility,
        refreshLayer,
        cleanup,
        isVisible
    };
};