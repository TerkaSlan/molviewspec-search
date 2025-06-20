import { BehaviorSubject, Observable } from 'rxjs';
import { ReactiveModel } from '../../../lib/reactive-model';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { SearchType, SuperpositionData } from '../types';

interface SearchStatus {
    isSearching: boolean;
    validationError: string | null;
}

interface SearchInput {
    query: string | null;
    searchType: SearchType;
}

interface SearchResults {
    items: SuperpositionData[];
    selectedResult: SuperpositionData | null;
}

interface SearchState {
    input: SearchInput;
    status: SearchStatus;
    results: SearchResults;
}

const initialState: SearchState = {
    input: {
        query: null,
        searchType: 'alphafind'
    },
    status: {
        isSearching: false,
        validationError: null
    },
    results: {
        items: [],
        selectedResult: null
    }
};

export class SearchModel extends ReactiveModel {
    private state$ = new BehaviorSubject<SearchState>(initialState);

    // Generic state selector
    getStateProperty$<K extends keyof SearchState>(property: K): Observable<SearchState[K]> {
        return this.state$.pipe(
            map(state => state[property]),
            distinctUntilChanged()
        );
    }

    // Organized selectors
    selectors = {
        search: {
            status: () => this.getStateProperty$('status'),
            input: () => this.getStateProperty$('input'),
            results: () => this.getStateProperty$('results')
        },
        input: {
            query: () => this.getStateProperty$('input').pipe(map(input => input.query)),
            searchType: () => this.getStateProperty$('input').pipe(map(input => input.searchType))
        },
        results: {
            items: () => this.getStateProperty$('results').pipe(map(results => results?.items ?? [])),
            selectedResult: () => this.getStateProperty$('results').pipe(map(results => results?.selectedResult))
        }
    };

    // Input-related selectors
    getQuery$() {
        return this.state$.pipe(map(state => state.input.query));
    }

    getSearchType$() {
        return this.state$.pipe(map(state => state.input.searchType));
    }

    // Status-related selectors
    getIsSearching$() {
        return this.state$.pipe(map(state => state.status.isSearching));
    }

    getValidationError$() {
        return this.state$.pipe(map(state => state.status.validationError));
    }

    // Results-related selectors
    getResults$() {
        return this.state$.pipe(map(state => state.results.items));
    }

    getSelectedResult$() {
        return this.state$.pipe(map(state => state.results.selectedResult));
    }

    // Actions
    setSearchStatus(status: Partial<SearchStatus>) {
        this.state$.next({
            ...this.state$.value,
            status: {
                ...this.state$.value.status,
                ...status
            }
        });
    }

    setSearchInput(input: Partial<SearchInput>) {
        this.state$.next({
            ...this.state$.value,
            input: {
                ...this.state$.value.input,
                ...input
            }
        });
    }

    setSearchResults(results: Partial<SearchResults>) {
        this.state$.next({
            ...this.state$.value,
            results: {
                ...this.state$.value.results,
                ...results
            }
        });
    }

    // Specific actions (using the new grouped setters)
    setSelectedResult(result: SuperpositionData | null) {
        this.setSearchResults({ selectedResult: result });
    }

    setValidationError(error: string | null) {
        this.setSearchStatus({ validationError: error });
    }

    async triggerSearch(query: string, searchType: SearchType) {
        // Update input state
        this.setSearchInput({ query, searchType });
        
        // Update status
        this.setSearchStatus({ 
            isSearching: true,
            validationError: null
        });

        try {
            // TODO: Implement actual search logic
            const results: SuperpositionData[] = [];
            
            // Update results
            this.setSearchResults({ 
                items: results,
                selectedResult: null
            });
        } catch (error) {
            this.setSearchStatus({ 
                validationError: error instanceof Error ? error.message : 'An error occurred'
            });
            throw error;
        } finally {
            this.setSearchStatus({ isSearching: false });
        }
    }

    clearSearch() {
        this.state$.next(initialState);
    }

    initializeWithResults(query: string, results: SuperpositionData[]) {
        this.state$.next({
            ...initialState,
            input: {
                ...initialState.input,
                query
            },
            results: {
                ...initialState.results,
                items: results
            }
        });
    }

    private setState(newState: Partial<SearchState>) {
        this.state$.next({
            ...this.state$.value,
            ...newState
        });
    }
} 