import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { StoryAtom, CurrentViewAtom } from '../mvs/atoms';
import { createSuperpositionTemplateStory } from '../mvs/examples/superposition';
import { SearchResultsStateAtom } from './atoms';
import { SuperpositionData } from './types';
import { SearchResults } from './ui/SearchResults';

export function SearchResultsContainer() {
    const {
        results,
        error,
        progress,
        query,
        isEmpty,
        hasResults
    } = useAtomValue(SearchResultsStateAtom);
    
    const setStory = useSetAtom(StoryAtom);
    const setCurrentView = useSetAtom(CurrentViewAtom);

    const handleResultClick = (superpositionData: SuperpositionData) => {
        if (!query) return;
        
        const newStory = createSuperpositionTemplateStory(query.inputValue, superpositionData);
        setStory(newStory);
        setCurrentView({ 
            type: 'scene', 
            id: newStory.scenes[0].id, 
            subview: '3d-view' 
        });
    };

    return (
        <SearchResults
            results={results}
            error={error}
            progress={progress}
            isEmpty={isEmpty}
            hasResults={hasResults}
            onResultClick={handleResultClick}
        />
    );
} 