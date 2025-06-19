import { useCallback } from 'react';
import { useReactiveModel } from '../../../lib/hooks/use-reactive-model';
import { useObservable } from '../../../lib/hooks/use-observable';
import { MappingModel, MappingState } from '../models/MappingModel';

const defaultValues: MappingState = {
    data: null,
    isLoading: false,
    error: null
};

function useStateProperty<K extends keyof MappingState>(model: MappingModel, key: K) {
    return useObservable(model.getStateProperty$(key), defaultValues[key]);
}

export function useMapping(model: MappingModel) {
    useReactiveModel(model);

    const state = {
        data: useStateProperty(model, 'data'),
        isLoading: useStateProperty(model, 'isLoading'),
        error: useStateProperty(model, 'error')
    };

    const fetchMapping = useCallback(async (pdbId: string) => {
        return model.fetchMapping(pdbId);
    }, [model]);

    return {
        mapping: state.data,
        isLoading: state.isLoading,
        error: state.error,
        fetchMapping
    };
} 