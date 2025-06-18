import React from 'react';
import { useAtomValue } from 'jotai';
import { SearchResultsStateAtom } from './atoms';
import { SearchResults } from './ui/SearchResults';

export function SearchResultsContainer() {
    const {
        results,
        error,
        progress,
        isEmpty,
        hasResults
    } = useAtomValue(SearchResultsStateAtom);

    return (
        <SearchResults
            results={results}
            error={error}
            progress={progress}
            isEmpty={isEmpty}
            hasResults={hasResults}
            onResultClick={() => {}} // No-op since we show all scenes at once
        />
    );
} 