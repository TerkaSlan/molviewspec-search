import React, { useEffect } from 'react';
import { useReactiveModel } from '../../lib/hooks/use-reactive-model';
import { useObservable } from '../../lib/hooks/use-observable';
import { SearchResults } from './ui/SearchResults';
import { SearchModel } from './models/SearchModel';
import { SuperpositionData } from './types';

interface SearchResultsContainerNextProps {
    model: SearchModel;
}

export function SearchResultsContainerNext({ model }: SearchResultsContainerNextProps) {
    // Connect the model to React's lifecycle
    useReactiveModel(model);

    // Subscribe to state
    const results = useObservable(model.getResults$(), []);
    const query = useObservable(model.getQuery$(), null);
    const error = useObservable(model.getValidationError$(), null);
    const isSearching = useObservable(model.getIsSearching$(), false);

    // Debug state changes
    useEffect(() => {
        console.log('[SearchResultsContainerNext] Results updated:', { count: results.length });
    }, [results]);

    useEffect(() => {
        console.log('[SearchResultsContainerNext] Search status:', { 
            isSearching, 
            error 
        });
    }, [isSearching, error]);

    const handleResultClick = (result: SuperpositionData) => {
        console.log('[SearchResultsContainerNext] Result clicked:', result.object_id);
        model.setSelectedResult(result);
    };

    return (
        <SearchResults
            results={results}
            error={error ? { message: error } : null}
            progress={null} // TODO: Add progress tracking to model if needed
            isEmpty={!query}
            hasResults={results.length > 0}
            onResultClick={handleResultClick}
        />
    );
} 