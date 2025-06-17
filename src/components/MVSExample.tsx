import React, { useState } from 'react';
import MVSViewer from './MolstarViewer';
import { SimpleStory } from '../app/state/examples/default';
import { useSetAtom, useAtom } from 'jotai';
import { StoryAtom, CurrentViewAtom } from '../app/state/atoms';

export function MVSExample() {
  const setStory = useSetAtom(StoryAtom);
  const [currentView, setCurrentView] = useAtom(CurrentViewAtom);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  const handleLoadStory = () => {
    setStory(SimpleStory);
    setCurrentView({ 
      type: 'scene', 
      id: SimpleStory.scenes[0].id, 
      subview: '3d-view' 
    });
    setCurrentSceneIndex(0);
  };

  const handleNextScene = () => {
    if (currentSceneIndex < SimpleStory.scenes.length - 1) {
      const nextIndex = currentSceneIndex + 1;
      setCurrentSceneIndex(nextIndex);
      setCurrentView({ 
        type: 'scene', 
        id: SimpleStory.scenes[nextIndex].id, 
        subview: '3d-view' 
      });
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIndex > 0) {
      const prevIndex = currentSceneIndex - 1;
      setCurrentSceneIndex(prevIndex);
      setCurrentView({ 
        type: 'scene', 
        id: SimpleStory.scenes[prevIndex].id, 
        subview: '3d-view' 
      });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleLoadStory}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Load Story
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handlePrevScene}
          disabled={currentSceneIndex === 0}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Previous Scene
        </button>
        <span style={{ margin: '0 10px' }}>
          Scene {currentSceneIndex + 1} of {SimpleStory.scenes.length}
        </span>
        <button 
          onClick={handleNextScene}
          disabled={currentSceneIndex === SimpleStory.scenes.length - 1}
          style={{ padding: '8px 16px' }}
        >
          Next Scene
        </button>
      </div>

      <div style={{ width: '800px', height: '600px' }}>
        <MVSViewer />
      </div>
    </div>
  );
} 