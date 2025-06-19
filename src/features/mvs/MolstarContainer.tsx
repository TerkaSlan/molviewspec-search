import React, { useEffect, useRef } from 'react';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { PluginSpec } from 'molstar/lib/mol-plugin/spec';
import { MolViewSpec } from 'molstar/lib/extensions/mvs/behavior';
import { PluginConfig } from 'molstar/lib/mol-plugin/config';
import { loadMVSData } from 'molstar/lib/extensions/mvs/components/formats';
import { Scheduler } from 'molstar/lib/mol-task';
import { SingleTaskQueue } from '../../utils';
import { Story } from '../types';
import { getMVSData, getMVSSnapshot } from './actions';
import { MolstarViewer } from './ui/MolstarViewer';
import { PluginCommands } from 'molstar/lib/mol-plugin/commands';
import { Subscription } from 'rxjs';
import { filter, debounceTime } from 'rxjs/operators';
import { MVSData, Snapshot } from 'molstar/lib/extensions/mvs/mvs-data';
import { molstarStateService } from './services/MolstarStateService';
import { useObservable } from '../../lib/hooks/use-observable';
import { globalStateService } from '../../lib/state/GlobalStateService';
import { SuperpositionData } from '../search/types';

interface MolstarContainerProps {
    story: Story | null;
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
function useMolstarState(plugin: PluginUIContext, story: Story | null) {
    useEffect(() => {
        const subscription = plugin.managers.snapshot.events.changed
            .pipe(
                debounceTime(100), // Debounce rapid updates
                filter(() => !!plugin.managers.snapshot.current) // Only process valid snapshots
            )
            .subscribe(() => {
                const current = plugin.managers.snapshot.current;
                if (current?.key) {
                    molstarStateService.setCurrentSceneKey(current.key);
                    
                    // Find the corresponding result and update global state
                    if (story?.scenes) {
                        const scene = story.scenes.find(scene => scene.key === current.key);
                        if (scene && 'result' in scene) {
                            const result = scene.result as SuperpositionData;
                            if (result) {
                                globalStateService.setSelectedResult(result);
                            }
                        }
                    }
                }
            });

        return () => subscription.unsubscribe();
    }, [plugin, story]);

    // Subscribe to scene changes from our state service
    useEffect(() => {
        const subscription = molstarStateService.getCurrentSceneKey$()
            .pipe(filter(key => !!key))
            .subscribe(async sceneKey => {
                if (!sceneKey) return;
                
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
    }, [plugin]);
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

export function MolstarContainer({ story }: MolstarContainerProps) {
    const modelRef = useRef<MolstarViewModel>();
    const currentSceneKey = useObservable(molstarStateService.getCurrentSceneKey$(), null);
    const shouldClearPlugin = useObservable(molstarStateService.getShouldClearPlugin$(), false);

    if (!_modelInstance) {
        _modelInstance = new MolstarViewModel();
    }

    if (!modelRef.current) {
        modelRef.current = _modelInstance;
    }

    const model = modelRef.current;

    // Set up state management
    useMolstarState(model.plugin, story);

    // Handle plugin clearing
    useEffect(() => {
        if (shouldClearPlugin && model) {
            model.clear().then(() => {
                molstarStateService.clearPluginComplete();
            });
        }
    }, [shouldClearPlugin, model]);

    // Load story when it changes
    useEffect(() => {
        if (story) {
            model.loadStory(story);
        }
    }, [story]);

    return (
        <div className="molstar-viewer">
            <MolstarViewer plugin={model.plugin} />
        </div>
    );
} 