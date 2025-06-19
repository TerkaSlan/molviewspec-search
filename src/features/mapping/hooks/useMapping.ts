import { useCallback } from 'react';
import { getPdbToUniprotMapping } from '../api';
import { globalStateService } from '../../../lib/state/GlobalStateService';
import { useGlobalState } from '../../../lib/hooks/use-global-state';

export function useMapping() {
    const mappingState = useGlobalState(service => service.getMappingState$());

    const fetchMapping = useCallback(async (pdbId: string) => {
        try {
            globalStateService.setMappingLoading(true);
            const data = await getPdbToUniprotMapping(pdbId);
            globalStateService.setMappingData(data);
            return data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch mapping';
            globalStateService.setMappingError(errorMessage);
            throw error;
        }
    }, []);

    return {
        mapping: mappingState?.data || null,
        isLoading: mappingState?.isLoading || false,
        error: mappingState?.error || null,
        fetchMapping
    };
} 