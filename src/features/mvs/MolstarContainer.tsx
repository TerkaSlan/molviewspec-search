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
import { StoryAtom, ActiveSceneAtom } from './atoms';
import { Story, SceneData } from '../types';
import { getMVSData } from './actions';
import { MolstarViewer } from './ui/MolstarViewer';

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

        this.queue.run(async () => {
            try {
                this.store?.set(IsLoadingAtom, true);
                const data = await getMVSData(story, [scene, scene]);
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
}

let _modelInstance: MolstarViewModel | null = null;
const IsLoadingAtom = atom(false);

export function MolstarContainer() {
    const modelRef = useRef<MolstarViewModel>();
    const isLoading = useAtomValue(IsLoadingAtom);

    if (!_modelInstance) {
        _modelInstance = new MolstarViewModel();
    }

    if (!modelRef.current) {
        modelRef.current = _modelInstance;
    }

    const model = modelRef.current;
    const story = useAtomValue(StoryAtom);
    const scene = useAtomValue(ActiveSceneAtom);

    model.store = useStore();

    useEffect(() => {
        model.loadStory(story, scene);
    }, [model, story, scene]);

    return (
        <div className="relative aspect-square w-full">
            <MolstarViewer 
                plugin={model.plugin}
                isLoading={isLoading}
            />
        </div>
    );
} 