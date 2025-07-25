import { useEffect, useRef } from 'react';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { PluginSpec } from 'molstar/lib/mol-plugin/spec';
import { MolViewSpec } from 'molstar/lib/extensions/mvs/behavior';
import { PluginConfig } from 'molstar/lib/mol-plugin/config';
import { loadMVSData } from 'molstar/lib/extensions/mvs/components/formats';
import { Scheduler } from 'molstar/lib/mol-task';
import { SingleTaskQueue } from '../../utils';
import { Story } from '../types';
import {  getMVSSnapshot } from './actions';
import { MolstarViewer } from './ui/MolstarViewer';
import { PluginCommands } from 'molstar/lib/mol-plugin/commands';
import { filter, debounceTime } from 'rxjs/operators';
import { MVSData, Snapshot } from 'molstar/lib/extensions/mvs/mvs-data';
import { useObservable } from '../../lib/hooks/use-observable';
import { SuperpositionData } from '../search/types';
import { MVSModel } from './models/MVSModel';

interface MolstarContainerProps {
    story: Story | null;
    model: MVSModel;
}

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
function useMolstarState(plugin: PluginUIContext, story: Story | null, model: MVSModel) {
    useEffect(() => {
        const subscription = plugin.managers.snapshot.events.changed
            .pipe(
                debounceTime(100), // Debounce rapid updates
                filter(() => !!plugin.managers.snapshot.current) // Only process valid snapshots
            )
            .subscribe(() => {
                const current = plugin.managers.snapshot.current;
                if (current?.key) {
                    model.setCurrentSceneKey(current.key);
                    
                    // Find the corresponding result and update state
                    if (story?.scenes) {
                        const scene = story.scenes.find(scene => scene.key === current.key);
                        if (scene && 'result' in scene) {
                            const result = scene.result as SuperpositionData;
                            if (result) {
                                model.setSelectedResult(result);
                            }
                        }
                    }
                }
            });

        return () => subscription.unsubscribe();
    }, [plugin, story, model]);

    // Subscribe to scene changes from our model
    useEffect(() => {
        const subscription = model.selectors.story.currentScene()
            .pipe(filter((key): key is string => key !== null))
            .subscribe(async (sceneKey: string) => {
                try {
                    const snapshotManager = plugin.managers.snapshot;
                    if (!snapshotManager) {
                        console.error('Snapshot manager not available');
                        return;
                    }

                    // Wait for snapshots to be available
                    const maxAttempts = 5;
                    const delayMs = 100;
                    
                    for (let attempt = 0; attempt < maxAttempts; attempt++) {
                        const entry = snapshotManager.state.entries.find(e => e.key === sceneKey);
                        if (entry) {
                            await PluginCommands.State.Snapshots.Apply(plugin, { id: entry.snapshot.id });
                            return;
                        }
                        if (attempt < maxAttempts - 1) {
                            await new Promise(resolve => setTimeout(resolve, delayMs));
                        }
                    }
                    
                    console.warn('No snapshot found for scene key:', sceneKey);
                } catch (error) {
                    console.error('Error selecting scene:', error);
                }
            });

        return () => subscription.unsubscribe();
    }, [plugin, model]);
}

class MolstarViewModel {
    private queue = new SingleTaskQueue();
    readonly plugin: PluginUIContext;
    private _isLoading = false;

    constructor() {
        this.plugin = createViewer();
        this.init();
    }

    private async init() {
        await this.plugin.init();
        this.plugin.initContainer();
    }

    dispose() {
        // Cleanup handled by useMolstarState hook
    }

    get isLoading() {
        return this._isLoading;
    }

    async clear() {
        await this.queue.run(async () => {
            try {
                await this.plugin.clear();
                await Scheduler.immediatePromise();
            } catch (error) {
                console.error('Error clearing Molstar plugin:', error);
            }
        });
    }

    async loadStory(story: Story) {
        if (!story) return;

        this.queue.run(async () => {
            try {
                this._isLoading = true;
                await this.plugin.initialized;
                await Scheduler.immediatePromise();

                const snapshots: Snapshot[] = [];

                for (const scene of story.scenes) {
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

                await loadMVSData(this.plugin, index, 'mvsj');
            } catch (error) {
                console.error('Error loading MVS data into Molstar:', error);
            } finally {
                this._isLoading = false;
            }
        });
    }
}

let _modelInstance: MolstarViewModel | null = null;

export function MolstarContainer({ story, model }: MolstarContainerProps) {
    const modelRef = useRef<MolstarViewModel>();
    //const currentSceneKey = useObservable(model.getCurrentSceneKey$(), null);
    const shouldClearPlugin = useObservable(model.selectors.viewer.shouldClearPlugin(), false);

    if (!_modelInstance) {
        _modelInstance = new MolstarViewModel();
    }

    if (!modelRef.current) {
        modelRef.current = _modelInstance;
    }

    const viewModel = modelRef.current;

    // Set up state management
    useMolstarState(viewModel.plugin, story, model);

    // Handle plugin clearing
    useEffect(() => {
        if (shouldClearPlugin && viewModel) {
            viewModel.clear().then(() => {
                model.clearPluginComplete();
            });
        }
    }, [shouldClearPlugin, viewModel, model]);

    // Load story when it changes
    useEffect(() => {
        if (story) {
            viewModel.loadStory(story);
        }
    }, [story, viewModel]);

    return (
        <div className="molstar-viewer">
            <MolstarViewer plugin={viewModel.plugin} />
        </div>
    );
} 