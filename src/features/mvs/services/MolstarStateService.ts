import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Story } from '../../types';
import { SuperpositionData } from '../../search/types';
import { createMultiSceneStory } from '../examples/superposition';

interface MolstarState {
  currentSceneKey: string | null;
  story: Story | null;
  shouldClearPlugin: boolean;
}

const initialState: MolstarState = {
  currentSceneKey: null,
  story: null,
  shouldClearPlugin: false
};

class MolstarStateService {
  private static instance: MolstarStateService;
  private state$ = new BehaviorSubject<MolstarState>(initialState);

  private constructor() {
    console.log('[MolstarStateService] Initialized');
  }

  public static getInstance(): MolstarStateService {
    if (!MolstarStateService.instance) {
      MolstarStateService.instance = new MolstarStateService();
    }
    return MolstarStateService.instance;
  }

  // Selectors
  getCurrentSceneKey$ = (): Observable<string | null> =>
    this.state$.pipe(
      distinctUntilChanged((prev, curr) => prev.currentSceneKey === curr.currentSceneKey),
      map(state => state.currentSceneKey)
    );

  getStory$ = (): Observable<Story | null> =>
    this.state$.pipe(
      distinctUntilChanged((prev, curr) => prev.story === curr.story),
      map(state => state.story)
    );

  getShouldClearPlugin$ = (): Observable<boolean> =>
    this.state$.pipe(
      distinctUntilChanged((prev, curr) => prev.shouldClearPlugin === curr.shouldClearPlugin),
      map(state => state.shouldClearPlugin)
    );

  // Actions
  setCurrentSceneKey(sceneKey: string | null) {
    console.log('[MolstarStateService] Setting current scene key:', sceneKey);
    this.state$.next({
      ...this.state$.value,
      currentSceneKey: sceneKey
    });
  }

  updateFromSearchResults(query: string | null, results: SuperpositionData[]) {
    console.log('[MolstarStateService] Updating from search results:', { query, resultCount: results.length });
    
    const story = query && results.length > 0
      ? createMultiSceneStory(query, results)
      : null;

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
    console.log('[MolstarStateService] Clearing state');
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
}

export const molstarStateService = MolstarStateService.getInstance(); 