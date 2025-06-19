import React, { useEffect } from 'react';
import { useReactiveModel } from '../../lib/hooks/use-reactive-model';
import { useBehavior } from '../../lib/hooks/use-behavior';
import { SearchModel } from './models/SearchModel';
import { Metadata } from './ui/Metadata';

interface MetadataContainerProps {
    model: SearchModel;
}

export function MetadataContainer({ model }: MetadataContainerProps) {
    useReactiveModel(model);
    
    const selectedResult = useBehavior(model.selectedResult$);
    const results = useBehavior(model.results$);
    const query = useBehavior(model.query$);
    
    // Debug state changes
    useEffect(() => {
        console.log('[MetadataContainer] Selected result:', selectedResult?.object_id);
    }, [selectedResult]);

    useEffect(() => {
        console.log('[MetadataContainer] Query/Results:', { 
            query, 
            resultCount: results?.length 
        });
    }, [query, results]);

    // If there are no results or query, don't render anything
    if (!results?.length || !query) {
        return null;
    }

    return (
        <Metadata 
            queryProteinId={query}
            selectedResult={selectedResult}
        />
    );
} 