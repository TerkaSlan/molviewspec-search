import React, { useEffect } from 'react';
import { useReactiveModel } from '../../lib/hooks/use-reactive-model';
import { useBehavior } from '../../lib/hooks/use-behavior';
import { SearchModel } from './models/SearchModel';
import { SearchResults } from './ui/SearchResults';

interface SearchResultsContainerProps {
    model: SearchModel;
}

export function SearchResultsContainer({ model }: SearchResultsContainerProps) {
    useReactiveModel(model);

    const results = useBehavior(model.results$) || [];
    const validationError = useBehavior(model.validationError$);
    const isSearching = useBehavior(model.isSearching$);
    const query = useBehavior(model.query$);

    // Debug state changes
    useEffect(() => {
        console.log('[SearchResultsContainer] Results updated:', { count: results.length });
    }, [results]);

    useEffect(() => {
        console.log('[SearchResultsContainer] Search status:', { isSearching, error: validationError });
    }, [isSearching, validationError]);

    const handleResultClick = (result: any) => {
        console.log('[SearchResultsContainer] Result clicked:', result.object_id);
        model.setSelectedResult(result);
    };

    return (
        <SearchResults
            results={results}
            error={validationError ? { message: validationError } : null}
            progress={isSearching ? { stage: 'processing', message: 'Searching...', attempt: 1, maxAttempts: 3 } : null}
            isEmpty={!query}
            hasResults={results.length > 0}
            onResultClick={handleResultClick}
        />
    );
} 