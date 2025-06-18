import { getDefaultStore, SetStateAction } from 'jotai';
import { 
    SearchStateAtom, 
    ValidationStateAtom, 
    SetSearchResultsAtom,
    SetSearchErrorAtom,
    SetSearchProgressAtom,
    RecentSearchesAtom
} from './atoms';
import { searchStructures } from './api';
import { 
    SearchQuery, 
    SearchError, 
    SearchOptions,
    AlphaFindResponse,
    SearchState,
    SearchValidationState
} from './types';
import { getPdbToUniprotMapping, determineInputType, getUniprotData } from '../mapping/api';

const API_TIMEOUT = 30000; // 30 seconds

// Helper for input validation
async function validateSearchInput(inputValue: string): Promise<'pdb' | 'uniprot'> {
    const store = getDefaultStore();
    
    try {
        store.set(ValidationStateAtom, {
            isValidating: true,
            error: null
        });

        const inputType = await determineInputType(inputValue.trim());
        
        if (inputType === 'invalid') {
            throw new Error('Invalid input: Please enter a valid PDB ID or UniProt ID');
        }

        return inputType;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error validating input';
        store.set(ValidationStateAtom, {
            isValidating: false,
            error: errorMessage
        });
        throw error;
    } finally {
        store.set(ValidationStateAtom, {
            isValidating: false,
            error: null
        });
    }
}

// Helper for UniProt ID resolution
async function resolveUniprotId(inputType: 'pdb' | 'uniprot', input: string): Promise<string> {
    if (inputType === 'uniprot') {
        return input;
    }
    
    const mapping = await getPdbToUniprotMapping(input);
    if (mapping.uniprotIds.length === 0) {
        throw new Error('No UniProt mapping found for this PDB ID');
    }
    return mapping.uniprotIds[0];
}

// Main search action
export async function performSearch(searchQuery: SearchQuery) {
    const store = getDefaultStore();
    
    try {
        // Update state to loading
        store.set(SearchStateAtom, state => ({
            ...state,
            status: 'loading',
            query: searchQuery,
            error: null,
            lastUpdated: Date.now()
        }));

        // Validate input
        const inputType = await validateSearchInput(searchQuery.inputValue);
        const uniprotId = await resolveUniprotId(inputType, searchQuery.inputValue);

        // Prepare search options with required query
        const searchOptions: Omit<SearchOptions, 'query'> = {
            limit: searchQuery.options.limit,
            superposition: searchQuery.options.superposition,
            searchType: searchQuery.searchType
        };

        // Handle different search types
        if (searchQuery.searchType === 'foldseek') {
            const uniprotData = await getUniprotData(uniprotId);
            searchOptions.fastaSequence = uniprotData.sequence.value;
        }

        // Create a cancelable search task
        const searchTask = async () => {
            const response = await searchStructures({
                ...searchOptions,
                query: uniprotId, // Explicitly provide query here
                onProgress: (progress) => {
                    store.set(SetSearchProgressAtom, progress);
                },
                onPartialResults: (data: AlphaFindResponse) => {
                    if (data.results) {
                        store.set(SetSearchResultsAtom, data.results);
                    }
                }
            });

            return response;
        };

        // Execute search with timeout
        const response = await Promise.race([
            searchTask(),
            new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Search timeout')), API_TIMEOUT)
            )
        ]);

        // Update state with final results
        if (response.results) {
            store.set(SetSearchResultsAtom, response.results);
        }

        return response;
    } catch (error) {
        // Handle errors
        const searchError: SearchError = {
            code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            details: error instanceof Error ? { stack: error.stack } : undefined
        };

        store.set(SetSearchErrorAtom, searchError);
        throw error;
    }
}

// Reset search state
export function resetSearch() {
    const store = getDefaultStore();
    store.set(SearchStateAtom, {
        status: 'idle',
        query: null,
        results: [],
        error: null,
        progress: null,
        lastUpdated: null
    });
}

// Update search type
export function updateSearchType(searchType: SearchQuery['searchType']) {
    const store = getDefaultStore();
    const currentState = store.get(SearchStateAtom);
    
    if (currentState.query) {
        store.set(SearchStateAtom, {
            ...currentState,
            query: {
                ...currentState.query,
                searchType
            }
        });
    }
}

export const resetAllSearchState = (
  setSearchState: (update: SetStateAction<SearchState>) => void,
  setValidationState: (update: SetStateAction<SearchValidationState>) => void,
  setRecentSearches: (update: SetStateAction<SearchQuery[]>) => void
) => {
  // Reset search state
  setSearchState({
    status: 'idle',
    query: null,
    results: [],
    error: null,
    progress: null,
    lastUpdated: null
  });

  // Reset validation state
  setValidationState({
    isValidating: false,
    error: null
  });

  // Optionally clear recent searches (commented out by default)
  // setRecentSearches([]);
}; 