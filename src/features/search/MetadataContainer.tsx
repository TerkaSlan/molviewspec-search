import React, { useEffect } from 'react';
import { useObservable } from '../../lib/hooks/use-observable';
import { useReactiveModel } from '../../lib/hooks/use-reactive-model';
import { Metadata } from './ui/Metadata';
import { SearchModel } from './models/SearchModel';

interface MetadataContainerProps {
    model: SearchModel;
}

export function MetadataContainer({ model }: MetadataContainerProps) {
    // Connect the model to React's lifecycle
    useReactiveModel(model);
    
    // Subscribe to state
    const query = useObservable(model.getQuery$(), null);
    const results = useObservable(model.getResults$(), []);
    const selectedResult = useObservable(model.getSelectedResult$(), null);
    
    // Debug state changes
    useEffect(() => {
        console.log('[MetadataContainer] Selected result:', selectedResult?.object_id);
    }, [selectedResult]);

    useEffect(() => {
        console.log('[MetadataContainer] Query/Results:', { 
            query, 
            resultCount: results.length 
        });
    }, [query, results]);

    // If there's no query or results, don't render anything
    if (!query || !results.length) {
        return null;
    }

    return (
        <Metadata 
            queryProteinId={query}
            selectedResult={selectedResult}
        />
    );
} 