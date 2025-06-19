import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { SuperpositionData, SearchType, SearchProgressInfo } from '../../features/search/types';
import { Story, CurrentView, Scene } from '../../features/types';
import { molstarStateService } from '../../features/mvs/services/MolstarStateService';
import { PDBToUniProtMapping } from '../../features/mapping/api';

// Global state interface that combines all feature states
export interface GlobalState {
  search: {
    query: string | null;
    searchType: SearchType | null;
    validationError: string | null;
    isValidating: boolean;
    isSearching: boolean;
    results: SuperpositionData[];
    progress: SearchProgressInfo | null;
    selectedResult: SuperpositionData | null;
    recentSearches: string[];
  };
  mapping: {
    data: PDBToUniProtMapping | null;
    isLoading: boolean;
    error: string | null;
  };
  mvs: {
    story: Story | null;
    currentView: CurrentView;
    activeSceneId: string | null;
    currentSnapshot: string | null;
  };
  debug: {
    enabled: boolean;
    lastAction: string;
    timestamp: number;
  }
}

const initialState: GlobalState = {
  search: {
    query: null,
    searchType: null,
    validationError: null,
    isValidating: false,
    isSearching: false,
    results: [],
    progress: null,
    selectedResult: null,
    recentSearches: []
  },
  mapping: {
    data: null,
    isLoading: false,
    error: null
  },
  mvs: {
    story: null,
    currentView: { type: 'story-options', subview: 'story-metadata' },
    activeSceneId: null,
    currentSnapshot: null
  },
  debug: {
    enabled: process.env.NODE_ENV === 'development',
    lastAction: 'INIT',
    timestamp: Date.now()
  }
};

class GlobalStateService {
  private static instance: GlobalStateService;
  private state$ = new BehaviorSubject<GlobalState>(initialState);

  private constructor() {
    this.debug('GlobalStateService initialized');
  }

  public static getInstance(): GlobalStateService {
    if (!GlobalStateService.instance) {
      GlobalStateService.instance = new GlobalStateService();
    }
    return GlobalStateService.instance;
  }

  private debug(action: string, data?: any) {
    if (this.state$.value.debug.enabled) {
      console.log(`[GlobalStateService] ${action}`, data);
      this.state$.next({
        ...this.state$.value,
        debug: {
          ...this.state$.value.debug,
          lastAction: action,
          timestamp: Date.now()
        }
      });
    }
  }

  // Search Selectors
  getSearchState$ = (): Observable<GlobalState['search']> =>
    this.state$.pipe(
      map(state => state.search),
      distinctUntilChanged()
    );

  getSearchResults$ = (): Observable<SuperpositionData[]> =>
    this.state$.pipe(
      map(state => state.search.results),
      distinctUntilChanged()
    );

  getIsSearching$ = (): Observable<boolean> =>
    this.state$.pipe(
      map(state => state.search.isSearching),
      distinctUntilChanged()
    );

  getSelectedResult$ = (): Observable<SuperpositionData | null> =>
    this.state$.pipe(
      map(state => state.search.selectedResult),
      distinctUntilChanged()
    );

  // MVS Selectors
  getMVSState$ = (): Observable<GlobalState['mvs']> =>
    this.state$.pipe(
      map(state => state.mvs),
      distinctUntilChanged()
    );

  getActiveScene$ = (): Observable<Scene | null> =>
    this.state$.pipe(
      map(state => {
        if (!state.mvs.story?.scenes.length) return null;
        if (!state.mvs.activeSceneId) return state.mvs.story.scenes[0];
        return state.mvs.story.scenes.find(scene => scene.id === state.mvs.activeSceneId) || state.mvs.story.scenes[0];
      }),
      distinctUntilChanged()
    );

  // Add mapping selectors
  getMappingState$ = (): Observable<GlobalState['mapping']> =>
    this.state$.pipe(
      map(state => state.mapping),
      distinctUntilChanged()
    );

  // Search Actions
  setSearchResults(results: SuperpositionData[]) {
    this.debug('setSearchResults', { resultsCount: results.length });
    
    const nextState = {
      ...this.state$.value,
      search: {
        ...this.state$.value.search,
        results,
        isSearching: false,
        progress: null
      }
    };
    
    this.state$.next(nextState);

    // Update Molstar state with new results
    if (nextState.search.query) {
      molstarStateService.updateFromSearchResults(nextState.search.query, results);
    }
  }

  setSearchQuery(query: string, searchType: SearchType) {
    this.debug('setSearchQuery', { query, searchType });
    
    // Only skip if exact same query/type AND no validation error AND not currently searching
    if (
      this.state$.value.search.query === query &&
      this.state$.value.search.searchType === searchType &&
      !this.state$.value.search.validationError &&
      !this.state$.value.search.isSearching
    ) {
      this.debug('setSearchQuery - skipping duplicate search', { query, searchType });
      return;
    }
    
    // Add to recent searches if query is not empty
    const recentSearches = query ? [
      query,
      ...this.state$.value.search.recentSearches.filter(q => q !== query)
    ].slice(0, 10) : this.state$.value.search.recentSearches;

    this.state$.next({
      ...this.state$.value,
      search: {
        ...this.state$.value.search,
        query,
        searchType,
        isSearching: true,
        validationError: null,
        progress: null,
        recentSearches
      }
    });
  }

  setSearchComplete() {
    this.debug('setSearchComplete');
    this.state$.next({
      ...this.state$.value,
      search: {
        ...this.state$.value.search,
        isSearching: false
      }
    });
  }

  setValidationError(error: string | null) {
    this.debug('setValidationError', { error });
    const nextState = {
      ...this.state$.value,
      search: {
        ...this.state$.value.search,
        validationError: error,
        results: error ? [] : this.state$.value.search.results,
        progress: error ? null : this.state$.value.search.progress,
        selectedResult: error ? null : this.state$.value.search.selectedResult
      }
    };
    
    this.state$.next(nextState);

    if (error) {
      molstarStateService.clear();
    }
  }

  setSearchProgress(progress: SearchProgressInfo | null) {
    this.debug('setSearchProgress', { progress });
    this.state$.next({
      ...this.state$.value,
      search: {
        ...this.state$.value.search,
        progress
      }
    });
  }

  setSelectedResult(result: SuperpositionData | null) {
    this.debug('setSelectedResult', { result });
    
    this.state$.next({
      ...this.state$.value,
      search: {
        ...this.state$.value.search,
        selectedResult: result
      },
      mvs: {
        ...this.state$.value.mvs,
        activeSceneId: result ? `scene_${result.object_id}` : null
      }
    });

    // Update Molstar state
    if (result) {
      molstarStateService.setCurrentSceneKey(`scene_${result.object_id}`);
    } else {
      molstarStateService.setCurrentSceneKey(null);
    }
  }

  // MVS Actions
  setStory(story: Story | null) {
    this.debug('setStory', { story });
    this.state$.next({
      ...this.state$.value,
      mvs: {
        ...this.state$.value.mvs,
        story,
        activeSceneId: story?.scenes[0]?.id || null
      }
    });
  }

  setCurrentView(view: CurrentView) {
    this.debug('setCurrentView', { view });
    this.state$.next({
      ...this.state$.value,
      mvs: {
        ...this.state$.value.mvs,
        currentView: view,
        activeSceneId: view.type === 'scene' ? view.id ?? null : this.state$.value.mvs.activeSceneId    
      }
    });
  }

  setActiveSceneId(sceneId: string | null) {
    this.debug('setActiveSceneId', { sceneId });
    this.state$.next({
      ...this.state$.value,
      mvs: {
        ...this.state$.value.mvs,
        activeSceneId: sceneId,
        currentView: sceneId 
          ? { type: 'scene', id: sceneId, subview: '3d-view' }
          : this.state$.value.mvs.currentView
      }
    });
  }

  setCurrentSnapshot(snapshot: string | null) {
    this.debug('setCurrentSnapshot', { snapshot });
    this.state$.next({
      ...this.state$.value,
      mvs: {
        ...this.state$.value.mvs,
        currentSnapshot: snapshot
      }
    });
  }

  // Add mapping actions
  setMappingData(data: PDBToUniProtMapping | null) {
    this.debug('setMappingData', { data });
    this.state$.next({
      ...this.state$.value,
      mapping: {
        ...this.state$.value.mapping,
        data,
        isLoading: false,
        error: null
      }
    });
  }

  setMappingLoading(isLoading: boolean) {
    this.debug('setMappingLoading', { isLoading });
    this.state$.next({
      ...this.state$.value,
      mapping: {
        ...this.state$.value.mapping,
        isLoading
      }
    });
  }

  setMappingError(error: string | null) {
    this.debug('setMappingError', { error });
    this.state$.next({
      ...this.state$.value,
      mapping: {
        ...this.state$.value.mapping,
        error,
        isLoading: false,
        data: null
      }
    });
  }

  // Global Actions
  clearAll() {
    this.debug('clearAll');
    this.state$.next({
      ...initialState,
      debug: this.state$.value.debug
    });
    molstarStateService.clear();
  }

  clearSearch() {
    this.debug('clearSearch');
    this.state$.next({
      ...this.state$.value,
      search: {
        ...initialState.search,
        query: this.state$.value.search.query,
        searchType: this.state$.value.search.searchType,
        isSearching: false,
        recentSearches: this.state$.value.search.recentSearches
      }
    });
    molstarStateService.clear();
  }
}

export const globalStateService = GlobalStateService.getInstance(); 