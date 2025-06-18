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
import { createMultiSceneStory } from '../mvs/examples/superposition';
import { StoryAtom, CurrentViewAtom, ActiveSceneIdAtom } from '../mvs/atoms';

// Initialize the story with preloaded data
const initialStory = createMultiSceneStory(defaultQuery, preloadedQ9FFD0Results);

// Set the initial value of StoryAtom
export const InitializeStoryAtom = atom(
    (get) => get(StoryAtom),
    (get, set) => {
        set(StoryAtom, initialStory);
    }
);

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

// Main search state atom
export const SearchStateAtom = atom<SearchState>(initialSearchState);

// Validation state atom
export const ValidationStateAtom = atom<SearchValidationState>({
    isValidating: false,
    error: null
});

// Recent searches atom with persistence
export const RecentSearchesAtom = atomWithStorage<SearchQuery[]>('recent_searches', []);

// Action atoms
export const SetSearchResultsAtom = atom(
    null,
    (get, set, results: AlphaFindStructure[]) => {
        set(SearchStateAtom, (prev) => ({
            ...prev,
            results,
            lastUpdated: Date.now()
        }));
    }
);

export const SetSearchErrorAtom = atom(
    null,
    (get, set, error: SearchError) => {
        set(SearchStateAtom, (prev) => ({
            ...prev,
            status: 'error',
            error,
            lastUpdated: Date.now()
        }));
    }
);

export const SetSearchProgressAtom = atom(
    null,
    (get, set, progress: SearchProgressInfo) => {
        set(SearchStateAtom, (prev) => ({
            ...prev,
            progress,
            lastUpdated: Date.now()
        }));
    }
);

// Derived state atoms
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
        isEmpty: !state.results.length,
        hasResults: state.results.length > 0
    };
});

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

// Atom to handle selected search result and navigate to its scene
export const SelectedSearchResultAtom = atom(
    null as SuperpositionData | null,
    (get, set, result: SuperpositionData) => {
        const story = get(StoryAtom);
        // Find the scene that corresponds to this result
        const targetScene = story.scenes.find(scene => 
            scene.description.includes(result.object_id.toUpperCase())
        );
        console.log('targetScene', targetScene);
        console.log('story scenes:', story.scenes.map(s => ({ id: s.id, description: s.description })));
        
        if (targetScene) {
            console.log('Updating scene to:', targetScene.id);
            // Only need to set ActiveSceneIdAtom now since it's bi-directional
            set(ActiveSceneIdAtom, targetScene.id);
        }
        set(SelectedSearchResultAtom, result);
    }
); 