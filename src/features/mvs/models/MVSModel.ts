import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ReactiveModel } from '../../../lib/reactive-model';
import { Story } from '../../types';
import { SuperpositionData } from '../../search/types';
import { createMultiSceneStory } from '../examples/superposition';

interface MVSState {
    currentSceneKey: string | null;
    story: Story | null;
    shouldClearPlugin: boolean;
}

const initialState: MVSState = {
    currentSceneKey: null,
    story: null,
    shouldClearPlugin: false
};

export class MVSModel extends ReactiveModel {
    private state = new BehaviorSubject<MVSState>(initialState);

    // Selectors
    getCurrentSceneKey$ = (): Observable<string | null> =>
        this.state.pipe(
            map(state => state.currentSceneKey),
            distinctUntilChanged()
        );

    getStory$ = (): Observable<Story | null> =>
        this.state.pipe(
            map(state => state.story),
            distinctUntilChanged()
        );

    getShouldClearPlugin$ = (): Observable<boolean> =>
        this.state.pipe(
            map(state => state.shouldClearPlugin),
            distinctUntilChanged()
        );

    // Actions
    setCurrentSceneKey(sceneKey: string | null) {
        console.log('[MVSModel] Setting current scene key:', sceneKey);
        this.state.next({
            ...this.state.value,
            currentSceneKey: sceneKey
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

        this.state.next({
            ...this.state.value,
            story,
            shouldClearPlugin: false
        });

        // If we have a story and no current scene, set the first scene as current
        if (story?.scenes[0] && !this.state.value.currentSceneKey) {
            this.setCurrentSceneKey(story.scenes[0].key);
        }
    }

    clear() {
        console.log('[MVSModel] Clearing state');
        // First clear the story and scene key
        this.state.next({
            ...initialState,
            shouldClearPlugin: true,
            story: null,
            currentSceneKey: null
        });

        // Emit a second update to ensure subscribers get the cleared state
        setTimeout(() => {
            this.state.next({
                ...initialState,
                shouldClearPlugin: true
            });
        }, 0);
    }

    clearPluginComplete() {
        this.state.next({
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
        return {
            currentState: this.state.value,
            hasSubscribers: this.state.observed,
            disposeActionsCount: (this as any).disposeActions?.length || 0
        };
    }
} 