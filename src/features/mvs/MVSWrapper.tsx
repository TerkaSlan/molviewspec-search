import React, { useEffect } from 'react';
import { useReactiveModel } from '../../lib/hooks/use-reactive-model';
import { useBehavior } from '../../lib/hooks/use-behavior';
import { SearchModel } from '../search/models/SearchModel';
import { MolstarContainer } from './MolstarContainer';

interface MVSWrapperProps {
    model: SearchModel;
}

export function MVSWrapper({ model }: MVSWrapperProps) {
    useReactiveModel(model);
    const story = useBehavior(model.story$);

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