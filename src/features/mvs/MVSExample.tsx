import React, { useState } from 'react';
import MVSViewer from './MVSViewer';
import { SimpleStory } from './examples/default';
import { useSetAtom, useAtom } from 'jotai';
import { StoryAtom, CurrentViewAtom } from './atoms';

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
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button 
          onClick={handleLoadStory}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Load Story
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={handlePrevScene}
          disabled={currentSceneIndex === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous Scene
        </button>
        <span>
          Scene {currentSceneIndex + 1} of {SimpleStory.scenes.length}
        </span>
        <button 
          onClick={handleNextScene}
          disabled={currentSceneIndex === SimpleStory.scenes.length - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Scene
        </button>
      </div>

      <div className="relative aspect-square w-full">
        <MVSViewer />
      </div>
    </div>
  );
} 