import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ReactiveModel } from '../../../lib/reactive-model';
import { Story } from '../../types';
import { SuperpositionData } from '../../search/types';
import { createMultiSceneStory } from '../examples/superposition';

interface MVSState {
    story: Story | null;
    currentSceneKey: string | null;
    shouldClearPlugin: boolean;
    selectedResult: SuperpositionData | null;
}

const initialState: MVSState = {
    currentSceneKey: null,
    story: null,
    shouldClearPlugin: false,
    selectedResult: null
};

export class MVSModel extends ReactiveModel {
    private state$ = new BehaviorSubject<MVSState>(initialState);

    // Generic state selector
    getStateProperty$<K extends keyof MVSState>(property: K): Observable<MVSState[K]> {
        return this.state$.pipe(
            map(state => state[property]),
            distinctUntilChanged()
        );
    }

    // Organized selectors
    selectors = {
        story: {
            current: () => this.getStateProperty$('story'),
            currentScene: () => this.getStateProperty$('currentSceneKey')
        },
        viewer: {
            shouldClearPlugin: () => this.getStateProperty$('shouldClearPlugin'),
            selectedResult: () => this.getStateProperty$('selectedResult')
        }
    };

    // Actions
    setCurrentSceneKey(sceneKey: string | null) {
        console.log('[MVSModel] Setting current scene key:', sceneKey);
        
        // Find the corresponding result for this scene
        let selectedResult: SuperpositionData | null = null;
        if (sceneKey && this.state$.value.story) {
            const scene = this.state$.value.story.scenes.find(scene => scene.key === sceneKey);
            if (scene && 'result' in scene) {
                selectedResult = scene.result as SuperpositionData;
            }
        }
        
        console.log('[MVSModel] Updating state with:', {
            sceneKey,
            selectedResultId: selectedResult?.object_id
        });
        
        // Update both scene key and selected result atomically
        this.state$.next({
            ...this.state$.value,
            currentSceneKey: sceneKey,
            selectedResult: selectedResult
        });
    }

    setSelectedResult(result: SuperpositionData) {
        this.state$.next({
            ...this.state$.value,
            selectedResult: result
        });
    }

    updateFromSearchResults(query: string | null, results: SuperpositionData[]) {
        console.log('[MVSModel] Updating from search results:', { query, resultCount: results.length });
        
        const story = query && results.length > 0
            ? createMultiSceneStory(query, results)
            : null;

        console.log('[MVSModel] Created story:', {
            hasStory: !!story,
            sceneCount: story?.scenes?.length || 0,
            metadata: story?.metadata
        });

        this.state$.next({
            ...this.state$.value,
            story,
            shouldClearPlugin: false
        });

        // If we have a story and no current scene, set the first scene as current
        if (story?.scenes[0] && !this.state$.value.currentSceneKey) {
            this.setCurrentSceneKey(story.scenes[0].key);
        }
    }

    clear() {
        console.log('[MVSModel] Clearing state');
        // First clear the story and scene key
        this.state$.next({
            ...initialState,
            shouldClearPlugin: true,
            story: null,
            currentSceneKey: null
        });

        // Emit a second update to ensure subscribers get the cleared state
        setTimeout(() => {
            this.state$.next({
                ...initialState,
                shouldClearPlugin: true
            });
        }, 0);
    }

    clearPluginComplete() {
        this.state$.next({
            ...initialState,
            shouldClearPlugin: false
        });
    }

    mount() {
        super.mount();
        console.log('[MVSModel] Mounted');
    }

    // Debug helper
    getDebugState() {
        return this.state$.value;
    }

    private setState(newState: Partial<MVSState>) {
        this.state$.next({
            ...this.state$.value,
            ...newState
        });
    }
} 