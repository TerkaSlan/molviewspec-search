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
    return view.type === 'scene' ? view.id : null;
  },
  (_get, set, newId: string | null) => {
    if (newId) {
      set(CurrentViewAtom, { 
        type: 'scene', 
        id: newId,
        subview: '3d-view'
      });
    }
  }
);

// Return first scene only if we have scenes and no active scene is selected
export const ActiveSceneAtom = atom((get) => {
  const story = get(StoryAtom);
  const activeId = get(ActiveSceneIdAtom);
  
  if (!story.scenes.length) {
    return null;
  }
  
  if (!activeId) {
    return story.scenes[0];
  }
  
  return story.scenes.find((scene) => scene.id === activeId) || story.scenes[0];
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

// New atom to track current snapshot
export const CurrentSnapshotAtom = atom<string | null>(null);