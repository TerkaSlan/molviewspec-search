import { useCallback, useMemo } from 'react';
import { useReactiveModel } from '../../../lib/hooks/use-reactive-model';
import { useObservable } from '../../../lib/hooks/use-observable';
import { MappingModel } from '../models/MappingModel';

export function useMapping() {
    const model = useMemo(() => new MappingModel(), []);
    useReactiveModel(model);

    const data = useObservable(model.getData$(), null);
    const isLoading = useObservable(model.getIsLoading$(), false);
    const error = useObservable(model.getError$(), null);

    const fetchMapping = useCallback(async (pdbId: string) => {
        return model.fetchMapping(pdbId);
    }, [model]);

    return {
        mapping: data,
        isLoading,
        error,
        fetchMapping
    };
} 