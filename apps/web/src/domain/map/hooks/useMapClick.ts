import type { Map } from 'ol';
import { useState } from 'react';
import { Style, Fill, Stroke } from 'ol/style';

import { colors } from '../../../styles/theme';

interface UseMapClickProps {
    map: Map | null;
    getCadastralParcelsLayer: () => any;
    updateCadastralLayerStyle: (styleFunction: (feature: any) => Style) => void;
    fetchFeatureById: (id: string) => Promise<any>;
    clearSelection: () => void;
}

export const useMapClick = ({
    map,
    getCadastralParcelsLayer,
    updateCadastralLayerStyle,
    fetchFeatureById,
    clearSelection,
}: UseMapClickProps) => {
    const [clickedCoordinate, setClickedCoordinate] = useState<number[] | null>(null);

    const handleMapClick = async (event: any) => {
        if (!map) return;

        const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => {
            return feature;
        });

        const cadastralLayer = getCadastralParcelsLayer();
        if (!cadastralLayer) return;

        if (feature) {
            const getFeatureStyle = (mapFeature: any) => {
                const isHighlighted = mapFeature.getId() === feature.getId();

                return new Style({
                    fill: new Fill({
                        color: isHighlighted
                            ? colors.tile.highlighted.fill
                            : colors.tile.fill,
                    }),
                    stroke: new Stroke({
                        color: isHighlighted
                            ? colors.tile.highlighted.stroke
                            : colors.tile.stroke,
                        width: isHighlighted ? 3 : 2,
                    }),
                });
            };

            updateCadastralLayerStyle(getFeatureStyle);

            const featureId = feature.getId() || feature.get('gid') || feature.get('id') || feature.get('objectid');

            if (featureId && (typeof featureId === 'string' || typeof featureId === 'number')) {
                await fetchFeatureById(String(featureId));
            } else {
                console.warn(' No valid feature ID found');
                console.log('Available feature properties for debugging:', feature.getProperties());
                clearSelection();
            }

            setClickedCoordinate(event.coordinate);
        } else {
            clearSelection();
            setClickedCoordinate(null);

            // Reset all features to normal style when no feature is clicked
            const getFeatureStyle = () => {
                return new Style({
                    fill: new Fill({
                        color: colors.tile.fill,
                    }),
                    stroke: new Stroke({
                        color: colors.tile.stroke,
                        width: 2,
                    }),
                });
            };

            updateCadastralLayerStyle(getFeatureStyle);
        }
    };

    const clearCoordinate = () => {
        setClickedCoordinate(null);
    };

    return {
        handleMapClick,
        clickedCoordinate,
        clearCoordinate,
    };
};