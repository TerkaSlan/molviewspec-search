import { BehaviorSubject } from 'rxjs';
import { ReactiveModel } from '../../../lib/reactive-model';
import { map } from 'rxjs/operators';
import { SearchType, SuperpositionData } from '../types';

interface SearchState {
    query: string | null;
    searchType: SearchType;
    results: SuperpositionData[];
    isSearching: boolean;
    validationError: string | null;
    selectedResult: SuperpositionData | null;
}

export class SearchModel extends ReactiveModel {
    private state$ = new BehaviorSubject<SearchState>({
        query: null,
        searchType: 'alphafind',
        results: [],
        isSearching: false,
        validationError: null,
        selectedResult: null
    });

    getQuery$() {
        return this.state$.pipe(map(state => state.query));
    }

    getSearchType$() {
        return this.state$.pipe(map(state => state.searchType));
    }

    getResults$() {
        return this.state$.pipe(map(state => state.results));
    }

    getIsSearching$() {
        return this.state$.pipe(map(state => state.isSearching));
    }

    getValidationError$() {
        return this.state$.pipe(map(state => state.validationError));
    }

    getSelectedResult$() {
        return this.state$.pipe(map(state => state.selectedResult));
    }

    private setState(newState: Partial<SearchState>) {
        this.state$.next({
            ...this.state$.value,
            ...newState
        });
    }

    setSearchQuery(query: string, searchType: SearchType) {
        this.setState({ query, searchType });
    }

    setValidationError(error: string | null) {
        this.setState({ validationError: error });
    }

    setSelectedResult(result: SuperpositionData | null) {
        this.setState({ selectedResult: result });
    }

    clearSearch() {
        this.setState({
            query: null,
            results: [],
            isSearching: false,
            validationError: null,
            selectedResult: null
        });
    }

    async triggerSearch(query: string, searchType: SearchType) {
        this.setState({ 
            isSearching: true, 
            validationError: null,
            query,
            searchType
        });
        // Actual search implementation would go here
        // For now, we're just setting the state
    }

    initializeWithResults(query: string, results: SuperpositionData[]) {
        this.setState({
            query,
            results,
            isSearching: false,
            validationError: null
        });
    }
} 