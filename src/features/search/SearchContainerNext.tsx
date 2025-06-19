import React, { useCallback } from 'react';
import { SearchInput } from './ui/SearchInput';
import { useReactiveModel } from '../../lib/hooks/use-reactive-model';
import { useObservable } from '../../lib/hooks/use-observable';
import { SearchModel } from './models/SearchModel';
import { SearchType } from './types';

interface SearchContainerNextProps {
    model: SearchModel;
}

export function SearchContainerNext({ model }: SearchContainerNextProps) {
    // Connect the model to React's lifecycle
    useReactiveModel(model);

    // Subscribe to state
    const query = useObservable(model.getQuery$(), null);
    const isSearching = useObservable(model.getIsSearching$(), false);
    const error = useObservable(model.getValidationError$(), null);

    const handleSearch = useCallback(async (inputValue: string, searchType: SearchType) => {
        try {
            console.log('[SearchContainerNext] Triggering search:', { inputValue, searchType });
            await model.triggerSearch(inputValue, searchType);
        } catch (error) {
            console.error('[SearchContainerNext] Search error:', error);
            model.setValidationError(error instanceof Error ? error.message : 'An error occurred');
        }
    }, [model]);

    const handleClear = useCallback(() => {
        console.log('[SearchContainerNext] Clearing search');
        model.clearSearch();
    }, [model]);

    return (
        <SearchInput
            value={query || ''}
            isLoading={isSearching}
            error={error}
            onSearch={handleSearch}
            onClear={handleClear}
        />
    );
} 