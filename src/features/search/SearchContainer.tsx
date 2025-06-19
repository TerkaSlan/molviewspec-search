import React from 'react';
import { useSearchState } from '../../lib/hooks/use-global-state';
import { SearchInput } from './ui/SearchInput';
import { SearchType } from './types';
import { defaultQuery } from './examples/preloaded';
import { globalStateService } from '../../lib/state/GlobalStateService';

export function SearchContainer() {
    const searchState = useSearchState();

    const handleSearch = async (searchType: SearchType) => {
        try {
            const query = searchState?.query || defaultQuery;
            globalStateService.setSearchQuery(query, searchType);
            // Note: The actual search logic should be moved to a separate service
            // that observes the global state and performs the search
        } catch (error) {
            console.error('Search failed:', error);
            globalStateService.setValidationError(error instanceof Error ? error.message : 'Search failed');
        }
    };

    return (
        <SearchInput
            value={searchState?.query || defaultQuery}
            onChange={(query: string) => globalStateService.setSearchQuery(query, searchState?.searchType || 'alphafind')}
            onSearch={handleSearch}
            isAlphaFindDisabled={searchState?.isSearching || false}
            isFoldseekDisabled={searchState?.isSearching || false}
            error={searchState?.validationError || null}
            searchType={searchState?.searchType || 'alphafind'}
        />
    );
} 