import { BehaviorSubject } from 'rxjs';
import { ReactiveModel } from '../../../lib/reactive-model';
import { SearchType, SuperpositionData, SearchProgressInfo } from '../types';
import { performSearch } from '../actions';
import { determineInputType } from '../../mapping/api';
import { createMultiSceneStory } from '../../mvs/examples/superposition';
import { Story } from '../../types';

interface SearchState {
    query: string | null;
    searchType: SearchType;
    isValidating: boolean;
    isSearching: boolean;
    validationError: string | null;
    results: SuperpositionData[];
    selectedResult: SuperpositionData | null;
    progress: SearchProgressInfo | null;
    story: Story | null;
}

const initialState: SearchState = {
    query: null,
    searchType: 'alphafind',
    isValidating: false,
    isSearching: false,
    validationError: null,
    results: [],
    selectedResult: null,
    progress: null,
    story: null
};

export class SearchModel extends ReactiveModel {
    private state$ = new BehaviorSubject<SearchState>(initialState);

    // Individual state subjects
    readonly query$ = new BehaviorSubject<string | null>(null);
    readonly searchType$ = new BehaviorSubject<SearchType>('alphafind');
    readonly validationError$ = new BehaviorSubject<string | null>(null);
    readonly isSearching$ = new BehaviorSubject<boolean>(false);
    readonly results$ = new BehaviorSubject<SuperpositionData[]>([]);
    readonly selectedResult$ = new BehaviorSubject<SuperpositionData | null>(null);
    readonly story$ = new BehaviorSubject<Story | null>(null);

    constructor() {
        super();
        this.log('constructor');
    }

    mount() {
        super.mount();
        
        // Subscribe to state changes and update individual subjects
        this.subscribe(this.state$, state => {
            this.log('state updated', state);
            this.query$.next(state.query);
            this.searchType$.next(state.searchType);
            this.validationError$.next(state.validationError);
            this.isSearching$.next(state.isSearching);
            this.results$.next(state.results);
            this.selectedResult$.next(state.selectedResult);
            
            // Only update story if it has changed
            if (state.story !== this.story$.value) {
                this.story$.next(state.story);
            }
        });

        // Initialize with current state
        this.state$.next(this.state$.value);
    }

    // Debug helper
    private log(action: string, data?: any) {
        console.log(`[SearchModel] ${action}`, data || '');
    }

    private updateStateAndCreateStory(newState: SearchState) {
        // Create story if we have results and query
        if (newState.results.length && newState.query) {
            this.log('creating new story', { resultCount: newState.results.length });
            newState.story = createMultiSceneStory(newState.query, newState.results);
        } else {
            newState.story = null;
        }
        
        this.state$.next(newState);
    }

    // Actions
    setQuery(query: string) {
        this.log('setQuery', query);
        this.updateStateAndCreateStory({
            ...this.state$.value,
            query,
            validationError: null // Clear error on new query
        });
    }

    setSearchType(searchType: SearchType) {
        this.log('setSearchType', searchType);
        this.updateStateAndCreateStory({
            ...this.state$.value,
            searchType
        });
    }

    setSelectedResult(result: SuperpositionData | null) {
        this.log('setSelectedResult', result?.object_id);
        this.updateStateAndCreateStory({
            ...this.state$.value,
            selectedResult: result
        });
    }

    async search(query: string, searchType: SearchType) {
        this.log('search', { query, searchType });
        try {
            // Start validation
            this.updateStateAndCreateStory({
                ...this.state$.value,
                isValidating: true,
                validationError: null
            });

            // Validate input
            const inputType = await determineInputType(query.trim());
            if (inputType === 'invalid') {
                this.log('validation failed');
                this.updateStateAndCreateStory({
                    ...this.state$.value,
                    isValidating: false,
                    validationError: 'Invalid input: Please enter a valid PDB ID or UniProt ID',
                    results: [],
                    selectedResult: null,
                    story: null
                });
                return;
            }

            // Start search
            this.log('starting search');
            this.updateStateAndCreateStory({
                ...this.state$.value,
                isValidating: false,
                isSearching: true,
                query,
                searchType
            });

            const searchResponse = await performSearch({
                inputValue: query,
                inputType: null,
                searchType,
                options: {
                    limit: 10,
                    superposition: true
                }
            });

            this.log('search completed', { resultCount: searchResponse.results?.length });
            
            // Update state with results
            const newState = {
                ...this.state$.value,
                isSearching: false,
                results: searchResponse.results || [],
                selectedResult: null // Clear selection on new results
            };
            this.log('updating state with results', newState);
            this.updateStateAndCreateStory(newState);

            return searchResponse.results;

        } catch (error) {
            this.log('search error', error);
            this.updateStateAndCreateStory({
                ...this.state$.value,
                isValidating: false,
                isSearching: false,
                validationError: error instanceof Error ? error.message : 'An unknown error occurred',
                results: [],
                selectedResult: null,
                story: null
            });
            throw error;
        }
    }

    clearSearch() {
        this.log('clearSearch');
        this.updateStateAndCreateStory(initialState);
    }

    dispose() {
        this.log('dispose');
        super.dispose();
    }
} 