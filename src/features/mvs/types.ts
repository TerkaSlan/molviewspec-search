export interface SceneData {
  id: string;
  description: string;
  data: any; // Replace with proper type from molstar MVS
}

export interface Story {
  metadata: {
    title: string;
    description: string;
  };
  scenes: SceneData[];
}

export type CurrentView = 
  | { type: 'story-options'; subview: 'story-metadata' }
  | { type: 'scene'; id: string; subview: 'scene-options' | '3d-view' }
  | { type: 'preview'; previous?: CurrentView }; 