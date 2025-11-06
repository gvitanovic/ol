import { useRef, useCallback } from 'react';
import MVT from 'ol/format/MVT';
import { Style, Fill, Stroke } from 'ol/style';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';

import { GISApiClient } from '@list-labs/api-client';

import { colors } from '../../../styles/theme';

export const useCadastralParcelsLayer = () => {
    const cadastralLayerRef = useRef<VectorTileLayer | null>(null);

    const createCadastralParcelsLayer = () => {
        const cadastralSource = new VectorTileSource({
            format: new MVT(),
            url: GISApiClient.getVectorTileUrl(),
        });

        const cadastralLayer = new VectorTileLayer({
            source: cadastralSource,
            style: new Style({
                fill: new Fill({
                    color: colors.tile.fill,
                }),
                stroke: new Stroke({
                    color: colors.tile.stroke,
                    width: 1,
                }),
            }),
        });

        cadastralLayerRef.current = cadastralLayer;
        return cadastralLayer;
    };

    const getCadastralParcelsLayer = useCallback(() => {
        if (!cadastralLayerRef.current) {
            return createCadastralParcelsLayer();
        }
        return cadastralLayerRef.current;
    }, []);

    const updateCadastralLayerStyle = useCallback((styleFunction: (feature: any) => Style) => {
        if (cadastralLayerRef.current) {
            cadastralLayerRef.current.setStyle(styleFunction);
        }
    }, []);

    const cleanup = useCallback(() => {
        if (cadastralLayerRef.current) {
            cadastralLayerRef.current.dispose();
            cadastralLayerRef.current = null;
        }
    }, []);

    return {
        getCadastralParcelsLayer,
        updateCadastralLayerStyle,
        cleanup
    };
};