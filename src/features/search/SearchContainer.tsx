import React from 'react';
import { useReactiveModel } from '../../lib/hooks/use-reactive-model';
import { useBehavior } from '../../lib/hooks/use-behavior';
import { SearchModel } from './models/SearchModel';
import { SearchInput } from './ui/SearchInput';
import { SearchType } from './types';
import { defaultQuery } from './examples/preloaded';

interface SearchContainerProps {
    model: SearchModel;
}

export function SearchContainer({ model }: SearchContainerProps) {
    useReactiveModel(model);

    // Subscribe to model state
    const query = useBehavior(model.query$) || defaultQuery;
    const searchType = useBehavior(model.searchType$);
    const validationError = useBehavior(model.validationError$);
    const isSearching = useBehavior(model.isSearching$);

    const handleSearch = async (newSearchType: SearchType) => {
        try {
            await model.search(query, newSearchType);
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    return (
        <SearchInput
            value={query}
            onChange={model.setQuery.bind(model)}
            onSearch={handleSearch}
            isAlphaFindDisabled={isSearching}
            isFoldseekDisabled={isSearching}
            error={validationError}
            searchType={searchType}
        />
    );
} 