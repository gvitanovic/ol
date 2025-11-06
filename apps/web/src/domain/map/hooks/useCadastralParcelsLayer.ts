import { useRef } from 'react';
import MVT from 'ol/format/MVT';
import { Style, Fill, Stroke } from 'ol/style';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';

import { GISApiClient } from '@gis-tools/api-client';

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
                    color: colors.primary.light,
                }),
                stroke: new Stroke({
                    color: colors.primary.DEFAULT,
                    width: 1,
                }),
            }),
        });

        cadastralLayerRef.current = cadastralLayer;
        return cadastralLayer;
    };

    const getCadastralParcelsLayer = () => {
        if (!cadastralLayerRef.current) {
            return createCadastralParcelsLayer();
        }
        return cadastralLayerRef.current;
    };

    const updateCadastralLayerStyle = (styleFunction: (feature: any) => Style) => {
        if (cadastralLayerRef.current) {
            cadastralLayerRef.current.setStyle(styleFunction);
        }
    };

    const cleanup = () => {
        if (cadastralLayerRef.current) {
            cadastralLayerRef.current.dispose();
            cadastralLayerRef.current = null;
        }
    };

    return {
        getCadastralParcelsLayer,
        updateCadastralLayerStyle,
        cleanup
    };
};