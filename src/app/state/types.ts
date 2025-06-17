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

export type SceneData = {
    id: string;
    header: string;
    key: string;
    description: string;
    javascript: string;
    linger_duration_ms?: number;
    transition_duration_ms?: number;
};

export type Story = {
    metadata: StoryMetadata;
    javascript: string;
    scenes: SceneData[];
    assets: SceneAsset[];
};

export type CurrentView =
  | { type: 'story-options'; subview: 'story-metadata' | 'story-wide-code' | 'asset-upload' }
  | { type: 'scene'; id: string; subview: 'scene-options' | '3d-view' }
  | { type: 'preview'; previous?: CurrentView };
