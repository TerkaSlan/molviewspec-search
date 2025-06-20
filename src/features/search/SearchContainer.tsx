import React, { useCallback } from 'react';
import { SearchInput } from './ui/SearchInput';
import { useReactiveModel } from '../../lib/hooks/use-reactive-model';
import { useObservable } from '../../lib/hooks/use-observable';
import { SearchModel } from './models/SearchModel';
import { SearchType } from './types';

interface SearchContainerProps {
    model: SearchModel;
}

export function SearchContainer({ model }: SearchContainerProps) {
    // Connect the model to React's lifecycle
    useReactiveModel(model);

    // Subscribe to grouped state
    const { query, searchType } = useObservable(model.selectors.search.input(), {
        query: null,
        searchType: 'alphafind' as SearchType,
        pdbMapping: null,
        inputType: 'uniprot'
    });
    const { isSearching, validationError } = useObservable(model.selectors.search.status(), {
        isSearching: false,
        validationError: null
    });

    const handleSearch = useCallback(async (inputValue: string, searchType: SearchType) => {
        try {
            console.log('[SearchContainer] Triggering search:', { inputValue, searchType });
            await model.triggerSearch(inputValue, searchType);
        } catch (error) {
            console.error('[SearchContainer] Search error:', error);
            model.setValidationError(error instanceof Error ? error.message : 'An error occurred');
        }
    }, [model]);

    const handleClear = useCallback(() => {
        console.log('[SearchContainer] Clearing search');
        model.clearSearch();
    }, [model]);

    return (
        <SearchInput
            value={query || ''}
            searchType={searchType}
            isLoading={isSearching}
            error={validationError}
            onSearch={handleSearch}
            onClear={handleClear}
            model={model}
        />
    );
} 