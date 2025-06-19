import React, { useEffect } from 'react';
import { MolstarContainer } from './MolstarContainer';
import { molstarStateService } from './services/MolstarStateService';
import { useObservable } from '../../lib/hooks/use-observable';

export function MVSWrapper() {
    const story = useObservable(molstarStateService.getStory$(), null);

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