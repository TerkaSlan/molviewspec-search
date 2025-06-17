import { atom } from 'jotai';
import { SimpleStory } from './examples/default';
import { CurrentView, Story } from './types';

export const StoryAtom = atom<Story>(SimpleStory);

export const CurrentViewAtom = atom<CurrentView>({ type: 'story-options', subview: 'story-metadata' });


export const ActiveSceneIdAtom = atom<string | undefined>((get) => {
    const view = get(CurrentViewAtom);
    return view.type === 'scene' ? view.id : undefined;
  });

// Derived atoms for automatic JavaScript execution
export const ActiveSceneAtom = atom((get) => {
    const story = get(StoryAtom);
    const activeId = get(ActiveSceneIdAtom);
    return story.scenes.find((scene) => scene.id === activeId) || story.scenes[0];
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

// New atoms for description panel
export interface DescriptionState {
  title: string | null;
  description: string | null;
  isLoading: boolean;
}

export const DescriptionAtom = atom<DescriptionState>({
  title: null,
  description: null,
  isLoading: false
});