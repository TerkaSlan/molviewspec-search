import React, { useEffect } from 'react';
import { MolstarContainer } from './MolstarContainer';
import { molstarStateService } from './services/MolstarStateService';
import { useObservable } from '../../lib/hooks/use-observable';

export function MVSWrapper() {
    const story = useObservable(molstarStateService.getStory$(), null);
    const shouldClearPlugin = useObservable(molstarStateService.getShouldClearPlugin$(), false);

    // Debug state changes
    useEffect(() => {
        console.log('[MVSWrapper] Story updated:', {
            hasStory: !!story,
            sceneCount: story?.scenes?.length || 0,
            isClearing: shouldClearPlugin
        });
    }, [story, shouldClearPlugin]);

    // Don't render container if we're clearing or have no story
    if (shouldClearPlugin || !story) {
        return <div className="viewer-container" />;
    }

    return (
        <div className="viewer-container">
            <MolstarContainer story={story} />
        </div>
    );
} 