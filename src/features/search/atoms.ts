import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { 
    SearchState, 
    SearchValidationState, 
    SearchQuery,
    SearchError,
    SearchProgressInfo,
    AlphaFindStructure,
    SuperpositionData
} from './types';
import { defaultQuery, preloadedQ9FFD0Results } from './examples/preloaded';

// Initial search state with default query and preloaded results
const initialSearchState: SearchState = {
    status: 'success',  // Changed from 'idle' to 'success' since we have results
    query: {
        inputValue: defaultQuery,
        inputType: 'uniprot',  // We know it's a UniProt ID
        searchType: 'alphafind',
        options: {
            limit: 10,
            superposition: true
        }
    },
    results: preloadedQ9FFD0Results,
    error: null,
    progress: null,
    lastUpdated: Date.now()
};

// Debug atom for development
const isDev = process.env.NODE_ENV === 'development';
export const DebugStateAtom = atom(
  (get) => {
    if (!isDev) return null;
    const searchState = get(SearchStateAtom);
    const validationState = get(ValidationStateAtom);
    const recentSearches = get(RecentSearchesAtom);
    
    return {
      searchState,
      validationState,
      recentSearches,
      timestamp: Date.now()
    };
  }
);

// Persist recent searches
export const RecentSearchesAtom = atomWithStorage<SearchQuery[]>('recent-searches', []);

// Main search state atom
export const SearchStateAtom = atom<SearchState>(initialSearchState);

// Input validation state atom
export const ValidationStateAtom = atom<SearchValidationState>({
    isValidating: false,
    error: null
});

// Combined atoms for components
export const SearchViewStateAtom = atom((get) => {
    const state = get(SearchStateAtom);
    const validation = get(ValidationStateAtom);
    
    return {
        status: state.status,
        query: state.query,
        results: state.results,
        error: state.error,
        progress: state.progress,
        isValidating: validation.isValidating,
        validationError: validation.error,
        hasResults: state.results.length > 0,
        isLoading: state.status === 'loading' || validation.isValidating,
        isEmpty: state.status === 'idle' && state.results.length === 0 && !state.error
    };
});

export const SearchInputStateAtom = atom((get) => {
    const state = get(SearchStateAtom);
    const validation = get(ValidationStateAtom);
    
    return {
        inputValue: state.query?.inputValue ?? '',
        isDisabled: state.status === 'loading' || validation.isValidating,
        error: validation.error || state.error?.message,
        searchType: state.query?.searchType ?? 'alphafind'
    };
});

export const SearchResultsStateAtom = atom((get) => {
    const state = get(SearchStateAtom);
    
    return {
        results: state.results,
        error: state.error,
        progress: state.progress,
        query: state.query,
        isEmpty: state.status === 'idle' && state.results.length === 0 && !state.error,
        hasResults: state.results.length > 0
    };
});

// Derived atoms for search state
export const SearchStatusAtom = atom((get) => get(SearchStateAtom).status);
export const SearchQueryAtom = atom((get) => get(SearchStateAtom).query);
export const SearchResultsAtom = atom((get) => get(SearchStateAtom).results);
export const SearchErrorAtom = atom((get) => get(SearchStateAtom).error);
export const SearchProgressAtom = atom((get) => get(SearchStateAtom).progress);

// Computed atoms for UI state
export const IsSearchingAtom = atom((get) => {
    const status = get(SearchStatusAtom);
    return status === 'loading' || status === 'validating';
});

export const HasResultsAtom = atom((get) => {
    const results = get(SearchResultsAtom);
    return results.length > 0;
});

export const HasErrorAtom = atom((get) => {
    const error = get(SearchErrorAtom);
    return error !== null;
});

// Action atoms
export const SetSearchResultsAtom = atom(
    null,
    (get, set, results: AlphaFindStructure[]) => {
        const currentState = get(SearchStateAtom);
        set(SearchStateAtom, {
            ...currentState,
            results,
            status: 'success',
            lastUpdated: Date.now()
        });
    }
);

export const SetSearchErrorAtom = atom(
    null,
    (get, set, error: SearchError) => {
        const currentState = get(SearchStateAtom);
        set(SearchStateAtom, {
            ...currentState,
            error,
            status: 'error',
            lastUpdated: Date.now()
        });
    }
);

export const SetSearchProgressAtom = atom(
    null,
    (get, set, progress: SearchProgressInfo) => {
        const currentState = get(SearchStateAtom);
        set(SearchStateAtom, {
            ...currentState,
            progress,
            lastUpdated: Date.now()
        });
    }
);

export const SearchQueryInputAtom = atom(
    (get) => get(SearchStateAtom).query?.inputValue ?? '',
    (get, set, newValue: string) => {
        const currentState = get(SearchStateAtom);
        if (currentState.query) {
            set(SearchStateAtom, {
                ...currentState,
                query: {
                    ...currentState.query,
                    inputValue: newValue
                }
            });
        } else {
            set(SearchStateAtom, {
                ...currentState,
                query: {
                    inputValue: newValue,
                    inputType: null,
                    searchType: 'alphafind',
                    options: {
                        limit: 10,
                        superposition: true
                    }
                }
            });
        }
        // Reset validation state when input changes
        set(ValidationStateAtom, {
            isValidating: false,
            error: null
        });
    }
);

export const ResetSearchAtom = atom(
    null,
    (get, set) => {
        set(SearchStateAtom, {
            status: 'idle',
            query: null,
            results: [],
            error: null,
            progress: null,
            lastUpdated: null
        });
        set(ValidationStateAtom, {
            isValidating: false,
            error: null
        });
    }
); 