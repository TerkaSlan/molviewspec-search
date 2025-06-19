import React, { useEffect } from 'react';
import { useSearchState } from '../../lib/hooks/use-global-state';
import { MolstarContainer } from './MolstarContainer';
import { createMultiSceneStory } from './examples/superposition';

export function MVSWrapper() {
    const searchState = useSearchState();
    const story = searchState?.query && searchState?.results.length > 0
        ? createMultiSceneStory(searchState.query, searchState.results)
        : null;

    // Debug state changes
    useEffect(() => {
        console.log('[MVSWrapper] Story updated:', {
            hasStory: !!story,
            sceneCount: story?.scenes.length
        });
    }, [story]);

    return (
        <div className="viewer-container">
            <MolstarContainer story={story} />
        </div>
    );
} 