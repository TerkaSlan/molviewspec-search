import React, { useEffect } from 'react';
import { useSearchState } from '../../lib/hooks/use-global-state';
import { Metadata } from './ui/Metadata';

export function MetadataContainer() {
    const searchState = useSearchState();
    
    // Debug state changes
    useEffect(() => {
        console.log('[MetadataContainer] Selected result:', searchState?.selectedResult?.object_id);
    }, [searchState?.selectedResult]);

    useEffect(() => {
        console.log('[MetadataContainer] Query/Results:', { 
            query: searchState?.query, 
            resultCount: searchState?.results.length 
        });
    }, [searchState?.query, searchState?.results]);

    // If there are no results or query, don't render anything
    if (!searchState?.results.length || !searchState?.query) {
        return null;
    }

    return (
        <Metadata 
            queryProteinId={searchState.query}
            selectedResult={searchState.selectedResult}
        />
    );
} 