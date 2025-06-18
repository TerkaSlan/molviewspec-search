import React, { useEffect, useRef } from 'react';
import { atom, useAtomValue, useStore } from 'jotai';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { PluginSpec } from 'molstar/lib/mol-plugin/spec';
import { MolViewSpec } from 'molstar/lib/extensions/mvs/behavior';
import { PluginConfig } from 'molstar/lib/mol-plugin/config';
import { loadMVSData } from 'molstar/lib/extensions/mvs/components/formats';
import { Scheduler } from 'molstar/lib/mol-task';
import { SingleTaskQueue } from '../../utils';
import { StoryAtom, ActiveSceneAtom, ActiveSceneIdAtom, CurrentViewAtom } from './atoms';
import { Story, SceneData } from '../types';
import { getMVSData } from './actions';
import { MolstarViewer } from './ui/MolstarViewer';
import { PluginCommands } from 'molstar/lib/mol-plugin/commands';

function createViewer() {
    const spec = DefaultPluginUISpec();
    const plugin = new PluginUIContext({
        ...spec,
        layout: {
            initial: {
                isExpanded: false,
                showControls: false,
            },
        },
        components: {
            remoteState: 'none',
        },
        behaviors: [...spec.behaviors, PluginSpec.Behavior(MolViewSpec)],
        config: [
            [PluginConfig.Viewport.ShowAnimation, false],
            [PluginConfig.Viewport.ShowSelectionMode, false],
            [PluginConfig.Viewport.ShowExpand, false],
            [PluginConfig.Viewport.ShowControls, false],
        ],
    });
    return plugin;
}

class MolstarViewModel {
    private queue = new SingleTaskQueue();
    readonly plugin: PluginUIContext;
    store: ReturnType<typeof useStore> | undefined = undefined;

    constructor() {
        this.plugin = createViewer();
        this.init();
    }

    private async init() {
        await this.plugin.init();
        this.plugin.initContainer();
    }

    async loadStory(story: Story, scene: SceneData) {
        if (!scene) return;
        console.log('Loading story with scene:', scene.id);

        this.queue.run(async () => {
            try {
                this.store?.set(IsLoadingAtom, true);
                const data = await getMVSData(story, story.scenes);
                await this.plugin.initialized;
                await Scheduler.immediatePromise();
                await loadMVSData(this.plugin, data, data instanceof Uint8Array ? 'mvsx' : 'mvsj');
            } catch (error) {
                console.error('Error loading MVS data into Molstar:', error);
            } finally {
                this.store?.set(IsLoadingAtom, false);
            }
        });
    }

    async selectScene(scene: SceneData) {
        if (!scene) return;
        console.log('Selecting scene:', scene.id);
        
        try {
            // Get the snapshot manager
            const snapshotManager = this.plugin.managers.snapshot;
            if (!snapshotManager) {
                console.error('Snapshot manager not available');
                return;
            }

            // Update state using built-in commands
            const entry = this.plugin.managers.snapshot.state.entries.find(e => e.key === scene.key);
            if (entry) {
                await PluginCommands.State.Snapshots.Apply(this.plugin, { id: entry.snapshot.id });
            }
        } catch (error) {
            console.error('Error selecting scene:', error);
        }
    }
}

let _modelInstance: MolstarViewModel | null = null;
const IsLoadingAtom = atom(false);

export function MolstarContainer() {
    const modelRef = useRef<MolstarViewModel>();
    const isLoading = useAtomValue(IsLoadingAtom);
    const activeSceneId = useAtomValue(ActiveSceneIdAtom);
    const currentView = useAtomValue(CurrentViewAtom);

    if (!_modelInstance) {
        _modelInstance = new MolstarViewModel();
    }

    if (!modelRef.current) {
        modelRef.current = _modelInstance;
    }

    const model = modelRef.current;
    const story = useAtomValue(StoryAtom);
    const scene = useAtomValue(ActiveSceneAtom);

    console.log('MolstarContainer state:', {
        activeSceneId,
        currentView,
        sceneId: scene?.id,
        storyScenes: story.scenes.map(s => s.id)
    });

    model.store = useStore();

    // Initial load effect
    useEffect(() => {
        if (!story.scenes.length) return;
        model.loadStory(story, story.scenes[0]);
    }, [model, story]);

    // Scene selection effect
    useEffect(() => {
        if (!scene) return;
        console.log('Selecting scene:', scene.id);
        model.selectScene(scene);
    }, [model, scene?.id]);

    return (
        <div className="relative aspect-square w-full">
            <MolstarViewer 
                plugin={model.plugin}
                isLoading={isLoading}
            />
        </div>
    );
} 