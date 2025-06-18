import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { SearchResultsStateAtom, SelectedSearchResultAtom } from './atoms';
import { SearchResults } from './ui/SearchResults';

export function SearchResultsContainer() {
    const {
        results,
        error,
        progress,
        isEmpty,
        hasResults
    } = useAtomValue(SearchResultsStateAtom);
    const setSelectedResult = useSetAtom(SelectedSearchResultAtom);

    return (
        <SearchResults
            results={results}
            error={error}
            progress={progress}
            isEmpty={isEmpty}
            hasResults={hasResults}
            onResultClick={setSelectedResult}
        />
    );
} 