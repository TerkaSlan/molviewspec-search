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

export const ActiveSceneIdAtom = atom<string | null>(null);

export const ActiveSceneAtom = atom((get) => {
  const story = get(StoryAtom);
  const activeId = get(ActiveSceneIdAtom);
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