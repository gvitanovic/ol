import { Style, Fill, Stroke } from 'ol/style';
import { useEffect, useRef, useState } from 'react';

import { LayerControl } from '../molecules/LayerControl';
import { FeaturePopup } from '../molecules/FeaturePopup';

import { useMap } from '../../domain/map/context/MapContext';
import { useCorineLandCover } from '../../domain/map/hooks/useCorineLandCover';
import { useFeatureInteraction } from '../../domain/map/hooks/useFeatureInteraction';
import { useCadastralParcelsLayer } from '../../domain/map/hooks/useCadastralParcelsLayer';

import { colors } from '../../styles/theme';

export const MapComponent = () => {
    const { map } = useMap();
    const mapRef = useRef<HTMLDivElement>(null);

    const { getCadastralParcelsLayer, updateCadastralLayerStyle, cleanup: cleanupCadastral } = useCadastralParcelsLayer();
    const { getCorineLayer, setVisibility: setCorineVisibility, toggleVisibility: handleToggleCorine, cleanup: cleanupCorine, isVisible: corineVisible } = useCorineLandCover();
    const { selectedFeature, loading, error, fetchFeatureById, clearSelection } = useFeatureInteraction();

    const [clickedCoordinate, setClickedCoordinate] = useState<number[] | null>(null);
    const [highlightedFeature, setHighlightedFeature] = useState<any>(null);

    useEffect(() => {
        if (!map || !mapRef.current) return;

        const containerRect = mapRef.current.getBoundingClientRect();

        if (containerRect.width === 0 || containerRect.height === 0) {
            console.warn('️Map container has zero dimensions, delaying initialization');
            setTimeout(() => {
                if (mapRef.current) {
                    const newRect = mapRef.current.getBoundingClientRect();
                    if (newRect.width > 0 && newRect.height > 0) {
                        map.updateSize();
                    }
                }
            }, 100);
        }

        map.setTarget(mapRef.current);

        requestAnimationFrame(() => {
            map.updateSize();
        });

        setTimeout(() => {
            map.updateSize();
        }, 200);

        const resizeObserver = new ResizeObserver(() => {
            map.updateSize();
        });
        resizeObserver.observe(mapRef.current);

        const layers = map.getLayers().getArray();
        layers.forEach((layer, index) => {
            if (index > 0) {
                map.removeLayer(layer);
            }
        });

        const cadastralLayer = getCadastralParcelsLayer();
        const corineLayer = getCorineLayer();

        map.addLayer(corineLayer);
        map.addLayer(cadastralLayer);

        const handleMapClick = async (event: any) => {
            const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => {
                return feature;
            });

            if (feature) {
                setHighlightedFeature(feature);

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
                setHighlightedFeature(null);
                clearSelection();
                setClickedCoordinate(null);

                // Force cadastral layer to re-render to clear highlighting
                const cadastralLayer = getCadastralParcelsLayer();
                if (cadastralLayer) {
                    cadastralLayer.changed();
                }
            }
        };

        map.on('click', handleMapClick);

        return () => {
            try {
                if (map) {
                    map.un('click', handleMapClick);
                }

                if (resizeObserver) {
                    resizeObserver.disconnect();
                }

                cleanupCadastral();
                cleanupCorine();

                if (map) {
                    map.setTarget(undefined);
                }
            } catch (error) {
                console.warn('Error during map cleanup:', error);
            }
        };
    }, [map]);

    useEffect(() => {
        const cadastralLayer = getCadastralParcelsLayer();
        if (!cadastralLayer) return;

        const getFeatureStyle = (feature: any) => {
            const isHighlighted = highlightedFeature &&
                feature.getId() === highlightedFeature.getId();

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
    }, [highlightedFeature, getCadastralParcelsLayer, updateCadastralLayerStyle]);

    useEffect(() => {
        if (map) {
            map.render();
            console.info('⚙️ Forced map render after CORINE visibility sync');
        }
    }, [corineVisible, setCorineVisibility, map]);

    return (
        <div
            className="relative w-full h-full"
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minWidth: '300px',
                minHeight: '200px'
            }}
        >
            <div
                ref={mapRef}
                className="w-full h-full map-fade-in"
                style={{
                    width: '100%',
                    height: '100%',
                    minWidth: '300px',
                    minHeight: '200px'
                }}
            />

            <LayerControl onToggleCorine={handleToggleCorine} corineVisible={corineVisible} />

            {selectedFeature && clickedCoordinate && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ zIndex: 1000 }}
                >
                    <FeaturePopup
                        feature={selectedFeature}
                        coordinate={clickedCoordinate}
                        loading={loading}
                        error={error}
                        onClose={() => {
                            clearSelection();
                            setClickedCoordinate(null);
                            setHighlightedFeature(null);
                        }}
                    />
                </div>
            )}
        </div>
    );
};