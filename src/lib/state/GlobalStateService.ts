import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { SearchState } from '../../features/search/state/SearchStateService';
import { SuperpositionData, SearchType, SearchProgressInfo } from '../../features/search/types';
import { getDefaultStore } from 'jotai';
import { CurrentSnapshotAtom } from '../../features/mvs/atoms';

// Global state interface that combines all feature states
export interface GlobalState {
  search: SearchState;
  debug: {
    enabled: boolean;
    lastAction: string;
    timestamp: number;
  }
}

const initialState: GlobalState = {
  search: {
    query: null,
    validationError: null,
    isValidating: false,
    isSearching: false,
    searchType: null,
    results: [],
    progress: null,
    selectedResult: null,
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
  private store = getDefaultStore();

  private constructor() {
    // Private constructor to prevent direct construction calls with 'new'
    this.debug('GlobalStateService initialized');
  }

  public static getInstance(): GlobalStateService {
    if (!GlobalStateService.instance) {
      GlobalStateService.instance = new GlobalStateService();
    }
    return GlobalStateService.instance;
  }

  private debug(action: string, data?: any) {
    if (!this.state$.value.debug.enabled) return;

    console.log(`[GlobalState] ${action}`, {
      timestamp: new Date().toISOString(),
      data: data || {},
      currentState: this.state$.value
    });

    this.state$.next({
      ...this.state$.value,
      debug: {
        ...this.state$.value.debug,
        lastAction: action,
        timestamp: Date.now()
      }
    });
  }

  // Search State Selectors
  getSearchState$ = (): Observable<SearchState> =>
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

  // Search State Actions
  setSearchResults(results: SuperpositionData[]) {
    this.debug('setSearchResults', { resultsCount: results.length });
    this.state$.next({
      ...this.state$.value,
      search: {
        ...this.state$.value.search,
        results,
        isSearching: false,
        progress: null
      }
    });
  }

  setSearchQuery(query: string, searchType: SearchType) {
    this.debug('setSearchQuery', { query, searchType });
    this.state$.next({
      ...this.state$.value,
      search: {
        ...this.state$.value.search,
        query,
        searchType,
        isSearching: true,
        validationError: null,
        progress: null
      }
    });
  }

  setValidationError(error: string | null) {
    this.debug('setValidationError', { error });
    this.state$.next({
      ...this.state$.value,
      search: {
        ...this.state$.value.search,
        validationError: error,
        results: error ? [] : this.state$.value.search.results,
        progress: error ? null : this.state$.value.search.progress,
        selectedResult: error ? null : this.state$.value.search.selectedResult
      }
    });
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
    
    // Update the selected result in global state
    this.state$.next({
      ...this.state$.value,
      search: {
        ...this.state$.value.search,
        selectedResult: result
      }
    });

    // Update the current snapshot in Jotai state
    if (result) {
      this.store.set(CurrentSnapshotAtom, `scene_${result.object_id}`);
    } else {
      this.store.set(CurrentSnapshotAtom, null);
    }
  }

  clearSearch() {
    this.debug('clearSearch');
    this.state$.next({
      ...this.state$.value,
      search: initialState.search
    });
    this.store.set(CurrentSnapshotAtom, null);
  }

  // Debug Actions
  enableDebug(enabled: boolean) {
    this.state$.next({
      ...this.state$.value,
      debug: {
        ...this.state$.value.debug,
        enabled
      }
    });
  }
}

// Export singleton instance
export const globalStateService = GlobalStateService.getInstance(); 