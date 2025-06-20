import React, { useEffect } from 'react';
import { useObservable } from '../../lib/hooks/use-observable';
import { useReactiveModel } from '../../lib/hooks/use-reactive-model';
import { Metadata } from './ui/Metadata';
import { SearchModel } from './models/SearchModel';
import { MVSModel } from '../mvs/models/MVSModel';
import { SuperpositionData } from './types';

function useSearchState(model: SearchModel) {
    return {
        query: useObservable(model.selectors.input.query(), null),
        results: useObservable(model.selectors.results.items(), []),
        selectedResult: useObservable(model.selectors.results.selectedResult(), null)
    };
}

interface MetadataContainerProps {
    model: SearchModel;
    mvsModel: MVSModel;
}

export function MetadataContainer({ model, mvsModel }: MetadataContainerProps) {
    // Connect the models to React's lifecycle
    useReactiveModel(model);
    useReactiveModel(mvsModel);
    
    // Subscribe to state using custom hooks
    const search = useSearchState(model);
    const mvsSelectedResult = useObservable(mvsModel.selectors.viewer.selectedResult(), null);
    
    // Use MVS selected result if available, otherwise fall back to search selected result
    const selectedResult = mvsSelectedResult || search.selectedResult;
    
    // Debug state changes
    useEffect(() => {
        console.log('[MetadataContainer] Selected result:', {
            fromMVS: mvsSelectedResult?.object_id,
            fromSearch: search.selectedResult?.object_id,
            current: selectedResult?.object_id
        });
    }, [mvsSelectedResult, search.selectedResult, selectedResult]);

    useEffect(() => {
        console.log('[MetadataContainer] Query/Results:', { 
            query: search.query, 
            resultCount: search.results.length 
        });
    }, [search.query, search.results]);

    // If there's no query or results, don't render anything
    if (!search.query || !search.results.length) {
        return null;
    }

    return (
        <Metadata 
            queryProteinId={search.query}
            selectedResult={selectedResult}
        />
    );
} 