import React, { useEffect, useRef } from 'react';
import { atom, useAtomValue, useStore, useSetAtom } from 'jotai';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { PluginSpec } from 'molstar/lib/mol-plugin/spec';
import { MolViewSpec } from 'molstar/lib/extensions/mvs/behavior';
import { PluginConfig } from 'molstar/lib/mol-plugin/config';
import { loadMVSData } from 'molstar/lib/extensions/mvs/components/formats';
import { Scheduler } from 'molstar/lib/mol-task';
import { SingleTaskQueue } from '../../utils';
import { StoryAtom, ActiveSceneAtom, ActiveSceneIdAtom, CurrentViewAtom, CurrentSnapshotAtom } from './atoms';
import { Story, SceneData } from '../types';
import { getMVSData } from './actions';
import { MolstarViewer } from './ui/MolstarViewer';
import { PluginCommands } from 'molstar/lib/mol-plugin/commands';
import { Subscription, Subject } from 'rxjs';
import { filter, debounceTime } from 'rxjs/operators';

// Separate concerns: Plugin creation
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

// Custom hook for managing Molstar state
function useMolstarState(plugin: PluginUIContext, store: ReturnType<typeof useStore>) {
    useEffect(() => {
        const stateUpdates$ = new Subject<{ type: 'snapshot'; key: string | null }>();
        
        const subscription = plugin.managers.snapshot.events.changed
            .pipe(
                debounceTime(100), // Debounce rapid updates
                filter(() => !!plugin.managers.snapshot.current) // Only process valid snapshots
            )
            .subscribe(() => {
                const current = plugin.managers.snapshot.current;
                stateUpdates$.next({ type: 'snapshot', key: current?.key || null });
            });

        const stateSubscription = stateUpdates$.subscribe(update => {
            if (update.type === 'snapshot') {
                store.set(CurrentSnapshotAtom, update.key);
            }
        });

        return () => {
            subscription.unsubscribe();
            stateSubscription.unsubscribe();
        };
    }, [plugin, store]);
}

class MolstarViewModel {
    private queue = new SingleTaskQueue();
    readonly plugin: PluginUIContext;
    private _store: ReturnType<typeof useStore> | undefined = undefined;

    constructor() {
        this.plugin = createViewer();
        this.init();
    }

    setStore(store: ReturnType<typeof useStore>) {
        this._store = store;
    }

    private async init() {
        await this.plugin.init();
        this.plugin.initContainer();
    }

    dispose() {
        // Cleanup handled by useMolstarState hook
    }

    async loadStory(story: Story, scene: SceneData) {
        if (!scene) return;

        this.queue.run(async () => {
            try {
                this._store?.set(IsLoadingAtom, true);
                const data = await getMVSData(story, story.scenes);
                await this.plugin.initialized;
                await Scheduler.immediatePromise();
                await loadMVSData(this.plugin, data, data instanceof Uint8Array ? 'mvsx' : 'mvsj');
                
                // After loading, select the initial scene
                await this.selectScene(scene);
            } catch (error) {
                console.error('Error loading MVS data into Molstar:', error);
            } finally {
                this._store?.set(IsLoadingAtom, false);
            }
        });
    }

    async selectScene(scene: SceneData) {
        if (!scene) return;
        
        try {
            const snapshotManager = this.plugin.managers.snapshot;
            if (!snapshotManager) {
                console.error('Snapshot manager not available');
                return;
            }

            // Wait for snapshots to be available
            const maxAttempts = 5;
            const delayMs = 100;
            
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                const entry = snapshotManager.state.entries.find(e => e.key === scene.key);
                if (entry) {
                    await PluginCommands.State.Snapshots.Apply(this.plugin, { id: entry.snapshot.id });
                    return;
                }
                if (attempt < maxAttempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            }
            
            console.warn('No snapshot found for scene key:', scene.key);
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
    const store = useStore();

    if (!_modelInstance) {
        _modelInstance = new MolstarViewModel();
    }

    if (!modelRef.current) {
        modelRef.current = _modelInstance;
    }

    const model = modelRef.current;
    const story = useAtomValue(StoryAtom);
    const scene = useAtomValue(ActiveSceneAtom);

    // Set up store and state management
    useEffect(() => {
        model.setStore(store);
    }, [store, model]);

    // Set up Molstar state management
    useMolstarState(model.plugin, store);

    // Initial load effect
    useEffect(() => {
        if (!story.scenes.length) return;
        model.loadStory(story, story.scenes[0]);
    }, [model, story]);

    // Scene selection effect - only trigger when we have an explicit scene selection
    useEffect(() => {
        if (!scene || !activeSceneId) return;
        model.selectScene(scene);
    }, [model, scene?.id, activeSceneId]);

    return (
        <div className="relative aspect-square w-full">
            <MolstarViewer 
                plugin={model.plugin}
                isLoading={isLoading}
            />
        </div>
    );
} 