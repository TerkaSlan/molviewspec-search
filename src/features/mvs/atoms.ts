import { atom } from 'jotai';
import { CurrentView, Story } from '../types';

// Initialize with an empty story
export const StoryAtom = atom<Story>({
  metadata: {
    title: ''
  },
  javascript: '',
  scenes: [],
  assets: []
});

export const CurrentViewAtom = atom<CurrentView>({ 
  type: 'story-options', 
  subview: 'story-metadata' 
});

// Make ActiveSceneIdAtom derive from and stay in sync with CurrentViewAtom
export const ActiveSceneIdAtom = atom(
  (get) => {
    const view = get(CurrentViewAtom);
    console.log('ActiveSceneIdAtom read:', view);
    return view.type === 'scene' ? view.id : null;
  },
  (_get, set, newId: string | null) => {
    console.log('ActiveSceneIdAtom write:', newId);
    if (newId) {
      set(CurrentViewAtom, { 
        type: 'scene', 
        id: newId,
        subview: '3d-view'
      });
    }
  }
);

// Modified to properly handle null activeId and add debugging
export const ActiveSceneAtom = atom((get) => {
  const story = get(StoryAtom);
  const activeId = get(ActiveSceneIdAtom);
  console.log('ActiveSceneAtom computation:', { activeId, sceneCount: story.scenes.length });
  
  if (!activeId) {
    console.log('No active ID, returning first scene');
    return story.scenes[0];
  }
  
  const scene = story.scenes.find((scene) => scene.id === activeId);
  console.log('Found scene:', scene?.id);
  return scene || story.scenes[0];
});

export const DescriptionAtom = atom<{
  title: string;
  description: string;
  isLoading: boolean;
}>({
  title: '',
  description: '',
  isLoading: false
});

// New atoms for search functionality
export interface SearchState {
  query: string;
  isLoading: boolean;
  error: string | null;
}

export const SearchAtom = atom<SearchState>({
  query: '',
  isLoading: false,
  error: null
});