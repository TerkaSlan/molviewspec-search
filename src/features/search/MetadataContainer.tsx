import React from 'react';
import { useAtomValue } from 'jotai';
import { CurrentSnapshotAtom } from '../mvs/atoms';
import { SearchStateAtom } from './atoms';
import { Metadata } from './ui/Metadata';

export function MetadataContainer() {
    const currentSnapshot = useAtomValue(CurrentSnapshotAtom);
    const searchState = useAtomValue(SearchStateAtom);
    
    // If there's no search state or no query, don't render anything
    if (!searchState.query || !searchState.results.length) {
        return null;
    }

    // Get the query protein ID
    const queryProteinId = searchState.query.inputValue;

    // Find the currently selected target protein based on the snapshot key
    const selectedResult = currentSnapshot 
        ? searchState.results.find(result => 
            currentSnapshot.includes(result.object_id.toLowerCase()) ||
            currentSnapshot.includes(result.object_id.toUpperCase())
        ) ?? null
        : null;

    return (
        <Metadata 
            queryProteinId={queryProteinId}
            selectedResult={selectedResult}
        />
    );
} 