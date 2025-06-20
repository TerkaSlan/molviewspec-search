import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { SuperpositionData, SearchType, SearchProgressInfo } from '../types';

export interface SearchState {
    query: string | null;
    validationError: string | null;
    isValidating: boolean;
    isSearching: boolean;
    searchType: SearchType | null;
    results: SuperpositionData[];
    progress: SearchProgressInfo | null;
    selectedResult: SuperpositionData | null;
}

const initialState: SearchState = {
    query: null,
    validationError: null,
    isValidating: false,
    isSearching: false,
    searchType: null,
    results: [],
    progress: null,
    selectedResult: null,
};

class SearchStateService {
    private state$ = new BehaviorSubject<SearchState>(initialState);
    private searchTrigger$ = new Subject<{ query: string; searchType: SearchType }>();

    // Selectors
    getValidationError$ = (): Observable<string | null> => 
        this.state$.pipe(
            map(state => state.validationError),
            distinctUntilChanged()
        );

    getResults$ = (): Observable<SuperpositionData[]> =>
        this.state$.pipe(
            map(state => state.results),
            distinctUntilChanged()
        );

    getIsSearching$ = (): Observable<boolean> =>
        this.state$.pipe(
            map(state => state.isSearching),
            distinctUntilChanged()
        );

    getSelectedResult$ = (): Observable<SuperpositionData | null> =>
        this.state$.pipe(
            map(state => state.selectedResult),
            distinctUntilChanged()
        );

    getQuery$ = (): Observable<string | null> =>
        this.state$.pipe(
            map(state => state.query),
            distinctUntilChanged()
        );

    // Actions
    setValidationError(error: string | null) {
        if (error) {
            // Clear search-related state when validation fails
            this.state$.next({
                ...this.state$.value,
                validationError: error,
                results: [],
                progress: null,
                selectedResult: null
            });
        } else {
            this.state$.next({
                ...this.state$.value,
                validationError: null
            });
        }
    }

    setSearchResults(results: SuperpositionData[]) {
        this.state$.next({
            ...this.state$.value,
            results,
            isSearching: false
        });
    }

    setSelectedResult(result: SuperpositionData | null) {
        this.state$.next({
            ...this.state$.value,
            selectedResult: result
        });
    }

    triggerSearch(query: string, searchType: SearchType) {
        this.searchTrigger$.next({ query, searchType });
    }

    clearSearch() {
        this.state$.next({
            ...initialState
        });
    }
}

export const searchStateService = new SearchStateService(); 