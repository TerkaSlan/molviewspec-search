import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { ReactiveModel } from '../../../lib/reactive-model';
import { SuperpositionData, SearchType, SearchProgressInfo } from '../types';
import { searchStructures } from '../api';
import { useFoldseek } from '../hooks/useFoldseek';

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

export class SearchModel extends ReactiveModel {
    private state = new BehaviorSubject<SearchState>(initialState);

    // Selectors
    getValidationError$ = (): Observable<string | null> => 
        this.state.pipe(
            map(state => state.validationError),
            distinctUntilChanged()
        );

    getResults$ = (): Observable<SuperpositionData[]> =>
        this.state.pipe(
            map(state => state.results),
            distinctUntilChanged()
        );

    getIsSearching$ = (): Observable<boolean> =>
        this.state.pipe(
            map(state => state.isSearching),
            distinctUntilChanged()
        );

    getSelectedResult$ = (): Observable<SuperpositionData | null> =>
        this.state.pipe(
            map(state => state.selectedResult),
            distinctUntilChanged()
        );

    getQuery$ = (): Observable<string | null> =>
        this.state.pipe(
            map(state => state.query),
            distinctUntilChanged()
        );

    // Actions
    setValidationError(error: string | null) {
        if (error) {
            // Clear search-related state when validation fails
            this.state.next({
                ...this.state.value,
                validationError: error,
                results: [],
                progress: null,
                selectedResult: null
            });
        } else {
            this.state.next({
                ...this.state.value,
                validationError: null
            });
        }
    }

    setSearchResults(results: SuperpositionData[]) {
        this.state.next({
            ...this.state.value,
            results,
            isSearching: false
        });
    }

    setSelectedResult(result: SuperpositionData | null) {
        this.state.next({
            ...this.state.value,
            selectedResult: result
        });
    }

    async triggerSearch(query: string, searchType: SearchType) {
        try {
            this.state.next({
                ...this.state.value,
                query,
                searchType,
                isSearching: true,
                validationError: null
            });

            const results = await searchStructures({
                query,
                limit: 10,
                superposition: true,
                onProgress: (progress) => {
                    if (progress) {
                        this.state.next({
                            ...this.state.value,
                            progress
                        });
                    }
                }
            });

            this.state.next({
                ...this.state.value,
                results: results.results || [],
                isSearching: false,
                progress: null
            });
        } catch (error) {
            this.setValidationError(error instanceof Error ? error.message : 'An error occurred during search');
        }
    }

    clearSearch() {
        this.state.next(initialState);
    }

    mount() {
        super.mount();
        console.log('[SearchModel] Mounted');
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