import { useCallback } from 'react';
import { useReactiveModel } from '../../../lib/hooks/use-reactive-model';
import { useObservable } from '../../../lib/hooks/use-observable';
import { MetadataModel } from '../models/MetadataModel';
import { MetadataState } from '../types';

const defaultValues: MetadataState = {
    data: null,
    isLoading: false,
    error: null
};

function useStateProperty<K extends keyof MetadataState>(model: MetadataModel, key: K) {
    return useObservable(model.getStateProperty$(key), defaultValues[key]);
}

export function useMetadata(model: MetadataModel) {
    useReactiveModel(model);

    const state = {
        data: useStateProperty(model, 'data'),
        isLoading: useStateProperty(model, 'isLoading'),
        error: useStateProperty(model, 'error')
    };

    const fetchMetadata = useCallback(async (uniprotId: string, inputType: 'uniprot' | 'pdb' | 'invalid' | null) => {
        return model.fetchMetadata(uniprotId, inputType);
    }, [model]);

    const clearMetadata = useCallback(() => {
        model.clearMetadata();
    }, [model]);

    return {
        metadata: state.data,
        isLoading: state.isLoading,
        error: state.error,
        fetchMetadata,
        clearMetadata
    };
} 