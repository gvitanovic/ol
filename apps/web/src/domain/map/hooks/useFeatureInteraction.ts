import { useState } from 'react';

import { GISApiClient } from '@list-labs/api-client';
import type { MapFeature } from '@list-labs/shared-types';

export const useFeatureInteraction = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null);

    const fetchFeatureById = async (id: string): Promise<MapFeature | null> => {
        setLoading(true);
        setError(null);

        try {
            const parcelData = await GISApiClient.getFeatureById(id);

            const feature: MapFeature = {
                id: parcelData.id.toString(),
                type: 'cadastral_parcel',
                properties: {
                    parcelNumber: parcelData.properties.parcel_number,
                    area: parcelData.properties.area,
                    cadastralMunicipality: parcelData.properties.cadastral_municipality,
                },
                geometry: parcelData.geometry ? parcelData.geometry : null,
            };

            setSelectedFeature(feature);

            return feature;
        } catch (err) {
            console.error('Error fetching feature data:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch feature data';
            setError(errorMessage);
            setSelectedFeature(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const clearSelection = () => {
        setSelectedFeature(null);
        setError(null);
    };

    const clearError = () => {
        setError(null);
    };

    return {
        selectedFeature,
        loading,
        error,
        fetchFeatureById,
        clearSelection,
        clearError,
    };
};