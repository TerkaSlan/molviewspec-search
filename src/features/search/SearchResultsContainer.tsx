import React, { useEffect } from 'react';
import { useSearchState } from '../../lib/hooks/use-global-state';
import { SearchResults } from './ui/SearchResults';
import { globalStateService } from '../../lib/state/GlobalStateService';
import { SuperpositionData } from './types';

export function SearchResultsContainer() {
    const searchState = useSearchState();

    // Debug state changes
    useEffect(() => {
        console.log('[SearchResultsContainer] Results updated:', { count: searchState?.results.length || 0 });
    }, [searchState?.results]);

    useEffect(() => {
        console.log('[SearchResultsContainer] Search status:', { 
            isSearching: searchState?.isSearching, 
            error: searchState?.validationError 
        });
    }, [searchState?.isSearching, searchState?.validationError]);

    const handleResultClick = (result: SuperpositionData) => {
        console.log('[SearchResultsContainer] Result clicked:', result.object_id);
        globalStateService.setSelectedResult(result);
    };

    return (
        <SearchResults
            results={searchState?.results || []}
            error={searchState?.validationError ? { message: searchState.validationError } : null}
            progress={searchState?.progress || null}
            isEmpty={!searchState?.query}
            hasResults={(searchState?.results.length || 0) > 0}
            onResultClick={handleResultClick}
        />
    );
} 