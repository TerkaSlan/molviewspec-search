import React, { useEffect, useRef, memo } from 'react';
import { Plugin } from 'molstar/lib/mol-plugin-ui/plugin';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { PluginSpec } from 'molstar/lib/mol-plugin/spec';
import { MolViewSpec } from 'molstar/lib/extensions/mvs/behavior';
import { PluginConfig } from 'molstar/lib/mol-plugin/config';
import { MVSData } from 'molstar/lib/extensions/mvs/mvs-data';
import { loadMVSData } from 'molstar/lib/extensions/mvs/components/formats';
import { Scheduler } from 'molstar/lib/mol-task';
import { SingleTaskQueue } from '../utils';
import { atom, useAtom, useAtomValue, useStore } from 'jotai/index';
import { StoryAtom, ActiveSceneAtom } from '../app/state/atoms';
import { Story, SceneData } from '../app/state/types';
import { getMVSData } from '../app/state/actions';

interface MVSViewerProps {
  width?: string;
  height?: string;
  onError?: (error: Error) => void;
  onStateChange?: (stateIndex: number) => void;
}

export interface MVSViewerRef {
  loadMVSSnapshot: (snapshot: MVSData) => Promise<void>;
  loadMVSFile: (data: Uint8Array | string, format: 'mvsj' | 'mvsx') => Promise<void>;
  getCurrentStateIndex: () => number;
  getTotalStates: () => number;
  setCurrentState: (index: number) => void;
  plugin: PluginUIContext;
}

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

class MVSViewModel {
  private queue = new SingleTaskQueue();
  readonly plugin: PluginUIContext;
  store: ReturnType<typeof useStore> | undefined = undefined;
  private onError?: (error: Error) => void;
  private onStateChange?: (index: number) => void;
  private currentStateIndex = 0;

  constructor(onError?: (error: Error) => void, onStateChange?: (index: number) => void) {
    this.plugin = createViewer();
    this.onError = onError;
    this.onStateChange = onStateChange;
    this.init();
  }

  private async init() {
    await this.plugin.init();
    // Init the container now so canvas3d is ready
    this.plugin.initContainer();
  }

  async loadStory(story: Story, scene: SceneData) {
    if (!scene) return;
  
    this.queue.run(async () => {
      try {
        this.store?.set(IsLoadingAtom, true);
        const data = await getMVSData(story, [scene, scene]);
        await this.plugin.initialized;
        // The plugin.initialized get triggered after plugin.init(),
        // before plugin.initContainer() is called. Depending on the use case,
        // there was an edge case where the `loadMVSData` was called before
        // the canvas was ready.
        await Scheduler.immediatePromise();
        await loadMVSData(this.plugin, data, data instanceof Uint8Array ? 'mvsx' : 'mvsj');
      } catch (error) {
        console.error('Error loading MVS data into Molstar:', error);
      } finally {
        this.store?.set(IsLoadingAtom, false);
      }
    });
  }
  /*
  getCurrentStateIndex(): number {
    return this.currentStateIndex;
  }

  getTotalStates(): number {
    return this.plugin.managers.structure.hierarchy.current.structures.length;
  }

  setCurrentState(index: number) {
    const totalStates = this.getTotalStates();
    if (index >= 0 && index < totalStates) {
      this.currentStateIndex = index;
      this.onStateChange?.(index);
    }
  }

  dispose() {
    if (this.plugin) {
      this.plugin.dispose();
    }
  }
    */
}

const PluginWrapper = memo(function _PluginWrapper({ plugin }: { plugin: PluginUIContext }) {
  return <Plugin plugin={plugin} />;
});


let _modelInstance: MVSViewModel | null = null;
const IsLoadingAtom = atom(false);

function LoadingIndicator() {
  const isLoading = useAtomValue(IsLoadingAtom);
  if (!isLoading) return null;

  return (
    <div className='absolute start-0 top-0 ps-4 pt-1' style={{ zIndex: 1000 }}>
      <span className='text-sm text-gray-500'>Loading...</span>
    </div>
  );
}

export function MVSViewer() {
  const modelRef = useRef<MVSViewModel>();
  
  if (!_modelInstance) {
    _modelInstance = new MVSViewModel();
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
    <div className='rounded overflow-hidden w-full h-full border border-border bg-background relative'>
      <div className='w-full h-full relative'>
        <PluginWrapper plugin={model.plugin} />
        <LoadingIndicator />
      </div>
    </div>
  );
}

MVSViewer.displayName = 'MVSViewer';

export default MVSViewer;