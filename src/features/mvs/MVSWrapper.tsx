import React, { useEffect } from 'react';
import { MolstarContainer } from './MolstarContainer';
import { useReactiveModel } from '../../lib/hooks/use-reactive-model';
import { useObservable } from '../../lib/hooks/use-observable';
import { MVSModel } from './models/MVSModel';

interface MVSWrapperProps {
    model: MVSModel;
}

export function MVSWrapper({ model }: MVSWrapperProps) {
    // Connect the model to React's lifecycle
    useReactiveModel(model);

    // Subscribe to state
    const story = useObservable(model.getStory$(), null);
    const shouldClearPlugin = useObservable(model.getShouldClearPlugin$(), false);

    // Debug state changes
    useEffect(() => {
        console.group('[MVSWrapper] State Update');
        console.log('Story:', {
            hasStory: !!story,
            sceneCount: story?.scenes?.length || 0,
            scenes: story?.scenes || [],
            metadata: story?.metadata || null
        });
        console.log('Should Clear:', shouldClearPlugin);
        console.groupEnd();
    }, [story, shouldClearPlugin]);

    // Debug model mount
    useEffect(() => {
        console.log('[MVSWrapper] Model mounted:', {
            hasModel: !!model,
            modelState: model.getDebugState?.() || 'No debug state available'
        });
    }, [model]);

    // Don't render container if we're clearing or have no story
    if (shouldClearPlugin || !story) {
        console.log('[MVSWrapper] Not rendering container:', {
            shouldClearPlugin,
            hasStory: !!story
        });
        return <div className="viewer-container" />;
    }

    console.log('[MVSWrapper] Rendering container with story');
    return (
        <div className="viewer-container">
            <MolstarContainer story={story} model={model} />
        </div>
    );
} 