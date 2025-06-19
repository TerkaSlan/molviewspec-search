import React, { useEffect } from 'react';
import { useReactiveModel } from '../../lib/hooks/use-reactive-model';
import { useObservable } from '../../lib/hooks/use-observable';
import { SearchResults } from './ui/SearchResults';
import { SearchModel } from './models/SearchModel';
import { SuperpositionData } from './types';
import { MVSModel } from '../mvs/models/MVSModel';

interface SearchResultsContainerProps {
    model: SearchModel;
    mvsModel: MVSModel;
}

export function SearchResultsContainer({ model, mvsModel }: SearchResultsContainerProps) {
    // Connect the model to React's lifecycle
    useReactiveModel(model);

    // Subscribe to state
    const results = useObservable(model.getResults$(), []);
    const query = useObservable(model.getQuery$(), null);
    const error = useObservable(model.getValidationError$(), null);
    const isSearching = useObservable(model.getIsSearching$(), false);

    // Debug state changes
    useEffect(() => {
        console.log('[SearchResultsContainer] Results updated:', { count: results.length });
    }, [results]);

    useEffect(() => {
        console.log('[SearchResultsContainer] Search status:', { 
            isSearching, 
            error 
        });
    }, [isSearching, error]);

    const handleResultClick = (result: SuperpositionData) => {
        console.log('[SearchResultsContainer] Result clicked:', result.object_id);
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
            model={mvsModel}
        />
    );
} 