import { SceneData, Story } from './types';
import { MVSData, Snapshot } from 'molstar/lib/extensions/mvs/mvs-data';
import { Zip } from 'molstar/lib/mol-util/zip/zip';

const createStateProvider = (code: string) => {
    return new Function('builder', code);
};


async function getMVSSnapshot(story: Story, scene: SceneData) {
    try {
        const stateProvider = createStateProvider(`
  async function _run_builder() {
        ${story.javascript}\n\n${scene.javascript}
  }
  return _run_builder();
  `);
        const builder = MVSData.createBuilder();
        await stateProvider(builder);
        const snapshot = builder.getSnapshot({
            key: scene.key.trim() || undefined,
            title: scene.header,
            description: scene.description,
            linger_duration_ms: scene.linger_duration_ms || 5000,
            transition_duration_ms: scene.transition_duration_ms || 500,
        });

        return snapshot;
    } catch (error) {
        console.error('Error creating state provider:', error);
        throw error;
    }
}


export async function getMVSData(story: Story, scenes: SceneData[] = story.scenes): Promise<MVSData | Uint8Array> {

    const snapshots: Snapshot[] = [];

    for (const scene of scenes) {
        const snapshot = await getMVSSnapshot(story, scene);
        snapshots.push(snapshot);
    }
    const index: MVSData = {
        kind: 'multiple',
        metadata: {
            title: story.metadata.title,
            timestamp: new Date().toISOString(),
            version: `${MVSData.SupportedVersion}`,
        },
        snapshots,
    };

    if (!story.assets.length) {
        return index;
    }

    const encoder = new TextEncoder();
    const files: Record<string, Uint8Array> = {
        'index.mvsj': encoder.encode(JSON.stringify(index)),
    };
    for (const asset of story.assets) {
        files[asset.name] = asset.content;
    }

    const zip = await Zip(files).run();
    return new Uint8Array(zip);
}