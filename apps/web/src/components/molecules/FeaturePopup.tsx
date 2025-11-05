import { useEffect, useState } from 'react';

import { type MapFeature } from '@list-labs/shared-types';

import { useMap } from '../../domain/map/context/MapContext';

interface FeaturePopupProps {
    loading?: boolean;
    onClose?: () => void;
    error?: string | null;
    feature: MapFeature | null;
    coordinate: number[] | null;
}

export const FeaturePopup: React.FC<FeaturePopupProps> = ({
    onClose,
    feature,
    coordinate,
    error = null,
    loading = false,
}) => {
    const { map } = useMap();
    const [pixelPosition, setPixelPosition] = useState<{ x: number; y: number } | null>(null);
    const [positioning, setPositioning] = useState<{ transform: string; transformOrigin: string }>({
        transform: 'translate(-50%, -100%)',
        transformOrigin: 'center bottom'
    });

    useEffect(() => {
        if (!map || !coordinate) {
            setPixelPosition(null);
            return;
        }

        const updatePosition = () => {
            try {
                const pixel = map.getPixelFromCoordinate(coordinate);
                if (pixel) {
                    const [x, y] = pixel;
                    const mapSize = map.getSize();

                    if (mapSize) {
                        const [mapWidth, mapHeight] = mapSize;

                        const popupWidth = 280;
                        const popupHeight = 150;
                        const padding = 10;

                        const spaceAbove = y;
                        const spaceBelow = mapHeight - y;
                        const spaceLeft = x;
                        const spaceRight = mapWidth - x;

                        let finalX = x;
                        let finalY = y;
                        let transform: string;
                        let transformOrigin: string;

                        if (spaceBelow >= popupHeight + padding) {
                            // Show below if there's enough space
                            transform = 'translate(-50%, 10px)';
                            transformOrigin = 'center top';
                        } else if (spaceAbove >= popupHeight + padding) {
                            // Show above if there's enough space
                            transform = 'translate(-50%, -100%)';
                            transformOrigin = 'center bottom';
                        } else {
                            // Not enough vertical space, try horizontal positioning
                            if (spaceRight >= popupWidth + padding) {
                                // Show to the right
                                transform = 'translate(100%, -50%)';
                                transformOrigin = 'left center';
                            } else if (spaceLeft >= popupWidth + padding) {
                                // Show to the left
                                transform = 'translate(-100%, -50%)';
                                transformOrigin = 'right center';
                            } else {
                                // Force above and adjust position if needed
                                transform = 'translate(-50%, -100%)';
                                transformOrigin = 'center bottom';

                                // Adjust Y to ensure popup stays in viewport
                                if (y - popupHeight < padding) {
                                    finalY = popupHeight + padding;
                                }
                            }
                        }

                        const halfPopupWidth = popupWidth / 2;
                        if (finalX - halfPopupWidth < padding) {
                            finalX = halfPopupWidth + padding;
                        } else if (finalX + halfPopupWidth > mapWidth - padding) {
                            finalX = mapWidth - halfPopupWidth - padding;
                        }

                        setPositioning({ transform, transformOrigin });
                        setPixelPosition({ x: finalX, y: finalY });
                    }
                }
            } catch (error) {
                console.warn('Error updating popup position:', error);
                setPixelPosition(null);
            }
        };

        updatePosition();

        const handlePostRender = () => updatePosition();
        map.on('postrender', handlePostRender);

        return () => {
            map.un('postrender', handlePostRender);
        };
    }, [map, coordinate]);

    if (!feature && !loading) {
        return null;
    }

    if (!pixelPosition) {
        return null;
    }

    const formatArea = (area: string | number | undefined): string => {
        if (!area || area === 'N/A') return 'N/A';
        const numericArea = typeof area === 'string' ? parseFloat(area) : area;
        return isNaN(numericArea) ? 'N/A' : `${numericArea.toLocaleString()} m²`;
    };

    return (
        <div
            className="fixed bg-white bg-opacity-80 p-3 rounded-lg shadow-xl border-4 border-blue-500 max-w-xs pointer-events-auto text-white font-bold animate-in fade-in zoom-in-95 duration-200"
            style={{
                left: `${pixelPosition?.x || 0}px`,
                top: `${pixelPosition?.y || 0}px`,
                transform: positioning.transform,
                transformOrigin: positioning.transformOrigin,
                minWidth: '200px',
                maxWidth: '280px',
                zIndex: 9999,
                position: 'fixed',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                padding: '0.2rem 0.4rem',
            }}
        >
            {loading ? (
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">Loading parcel data...</span>
                </div>
            ) : error ? (
                <div className="text-red-600">
                    <h3 className="text-lg font-semibold mb-2">️Error</h3>
                    <p className="text-sm">{error}</p>
                    {feature && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-sm text-gray-600">ID: {feature.id}</p>
                        </div>
                    )}
                </div>
            ) : feature ? (
                <div>
                    <div className="flex justify-between items-start mb-2" >
                        <h3 className="text-base font-semibold text-blue-700 border-b border-blue-100 pb-1 flex-1">
                            ⛳️ Parcel Info
                        </h3>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="ml-2 text-gray-400 hover:text-gray-600 text-lg leading-none top-2 rigth-2"
                                title="Close popup"
                            >
                                ×
                            </button>
                        )}
                    </div>
                    <div className="space-y-1.5 text-sm">
                        <div>
                            <span className="font-medium text-gray-700">Area:</span>
                            <span className="ml-2 text-gray-900">
                                {formatArea(feature.properties.area)}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Number:</span>
                            <span className="ml-2 text-gray-900 font-mono">
                                {feature.properties.parcelNumber || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Municipality:</span>
                            <span className="ml-2 text-gray-900">
                                {feature.properties.cadastralMunicipality || 'N/A'}
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-300">
                            Click empty area to close
                        </p>
                    </div>
                </div>
            ) : null}
        </div>
    );
};