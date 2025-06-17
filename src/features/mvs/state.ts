import { atom } from 'jotai';
import { Story, CurrentView, SceneData } from '../types';

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

export const ActiveSceneIdAtom = atom<string | undefined>((get) => {
  const view = get(CurrentViewAtom);
  return view.type === 'scene' ? view.id : undefined;
});

export const ActiveSceneAtom = atom((get) => {
  const story = get(StoryAtom);
  const activeId = get(ActiveSceneIdAtom);
  return story.scenes.find((scene) => scene.id === activeId) || story.scenes[0];
}); 