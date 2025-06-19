import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Story } from '../../types';
import { SuperpositionData } from '../../search/types';
import { createMultiSceneStory } from '../examples/superposition';

interface MolstarState {
  currentSceneKey: string | null;
  story: Story | null;
}

const initialState: MolstarState = {
  currentSceneKey: null,
  story: null
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
      story
    });

    // If we have a story and no current scene, set the first scene as current
    if (story?.scenes[0] && !this.state$.value.currentSceneKey) {
      this.setCurrentSceneKey(story.scenes[0].key);
    }
  }

  clear() {
    console.log('[MolstarStateService] Clearing state');
    this.state$.next(initialState);
  }
}

export const molstarStateService = MolstarStateService.getInstance(); 