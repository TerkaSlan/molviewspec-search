import React, { useEffect } from 'react';
import { useObservable } from '../../lib/hooks/use-observable';
import { globalStateService } from '../../lib/state/GlobalStateService';
import { Metadata } from './ui/Metadata';

export function MetadataContainer() {
    const searchState = useObservable(globalStateService.getSearchState$(), null);
    
    // Debug state changes
    useEffect(() => {
        console.log('[MetadataContainer] Selected result:', searchState?.selectedResult?.object_id);
    }, [searchState?.selectedResult]);

    useEffect(() => {
        console.log('[MetadataContainer] Query/Results:', { 
            query: searchState?.query, 
            resultCount: searchState?.results?.length 
        });
    }, [searchState?.query, searchState?.results]);

    // If there's no search state, query, or results, don't render anything
    if (!searchState || !searchState.query || !searchState.results?.length) {
        return null;
    }

    return (
        <Metadata 
            queryProteinId={searchState.query}
            selectedResult={searchState.selectedResult}
        />
    );
} 