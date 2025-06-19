export type StoryContainer = {
    version: 1;
    story: Story;
};

export type StoryMetadata = {
    title: string;
};

export type SceneAsset = {
    name: string;
    content: Uint8Array;
};

export interface SceneData {
  id: string;
  key: string;
  header: string;
  description: string;
  javascript: string;
  linger_duration_ms?: number;
  transition_duration_ms?: number;
}

export interface Scene extends SceneData {
  data: any;
}

export interface Story {
  metadata: {
    title: string;
  };
  javascript: string;
  scenes: Scene[];
  assets: any[];
}

export interface CurrentView {
  type: 'story-options' | 'scene';
  subview: 'story-metadata' | '3d-view';
  id?: string;
}
