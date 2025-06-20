import { BehaviorSubject, Observable } from 'rxjs';
import { ReactiveModel } from '../../../lib/reactive-model';
import { map, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { SearchType, SuperpositionData } from '../types';
import { searchStructures } from '../api';
import { determineInputType, validatePdbId, validateUniprotId, getPdbToUniprotMapping } from '../../mapping/api';

interface SearchStatus {
    isSearching: boolean;
    validationError: string | null;
}

interface SearchInput {
    query: string | null;
    searchType: SearchType;
    pdbMapping: {
        pdbId: string;
        uniprotId: string;
    } | null;
}

interface SearchResults {
    items: SuperpositionData[];
    selectedResult: SuperpositionData | null;
}

interface SearchState {
    input: SearchInput;
    status: SearchStatus;
    results: SearchResults;
    pagination: {
        currentPage: number;
        itemsPerPage: number;
    };
    lastProcessedMVSResult: string | null;
}

const initialState: SearchState = {
    input: {
        query: null,
        searchType: 'alphafind',
        pdbMapping: null
    },
    status: {
        isSearching: false,
        validationError: null
    },
    results: {
        items: [],
        selectedResult: null
    },
    pagination: {
        currentPage: 1,
        itemsPerPage: 5
    },
    lastProcessedMVSResult: null
};

// Add a helper function for deep comparison
function deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (typeof a !== 'object' || typeof b !== 'object') return false;
    if (a === null || b === null) return false;
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => deepEqual(a[key], b[key]));
}

export class SearchModel extends ReactiveModel {
    private state$ = new BehaviorSubject<SearchState>(initialState);

    // Create a shared, cached tableData$ observable
    private tableData$ = this.state$.pipe(
        map(state => {
            const { items } = state.results;
            const { currentPage, itemsPerPage } = state.pagination;
            
            // Calculate paginated data
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedItems = items.slice(startIndex, endIndex);
            
            // Calculate empty rows needed
            const emptyRowsCount = Math.max(0, itemsPerPage - paginatedItems.length);
            
            return {
                items: paginatedItems,
                emptyRowsCount,
                totalPages: Math.ceil(items.length / itemsPerPage),
                currentPage,
                totalItems: items.length
            };
        }),
        distinctUntilChanged((prev, curr) => 
            prev.currentPage === curr.currentPage &&
            prev.totalPages === curr.totalPages &&
            prev.totalItems === curr.totalItems &&
            prev.emptyRowsCount === curr.emptyRowsCount &&
            deepEqual(prev.items, curr.items)
        ),
        shareReplay(1)
    );

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
            results: () => this.getStateProperty$('results'),
            lastProcessedMVSResult: () => this.getStateProperty$('lastProcessedMVSResult')
        },
        input: {
            query: () => this.getStateProperty$('input').pipe(
                map(input => input.query),
                distinctUntilChanged()
            ),
            searchType: () => this.getStateProperty$('input').pipe(
                map(input => input.searchType),
                distinctUntilChanged()
            ),
            pdbMapping: () => this.getStateProperty$('input').pipe(
                map(input => input.pdbMapping),
                distinctUntilChanged((prev, curr) => deepEqual(prev, curr))
            )
        },
        results: {
            items: () => this.getStateProperty$('results').pipe(
                map(results => results?.items ?? []),
                distinctUntilChanged((prev, curr) => deepEqual(prev, curr))
            ),
            selectedResult: () => this.getStateProperty$('results').pipe(
                map(results => results?.selectedResult),
                distinctUntilChanged((prev, curr) => deepEqual(prev, curr))
            ),
            tableData: () => this.tableData$,
            paginatedItems: () => this.tableData$.pipe(
                map(data => data.items)
            )
        },
        pagination: {
            currentPage: () => this.tableData$.pipe(
                map(data => data.currentPage)
            ),
            totalPages: () => this.tableData$.pipe(
                map(data => data.totalPages)
            ),
            itemsPerPage: () => this.getStateProperty$('pagination').pipe(
                map(p => p.itemsPerPage),
                distinctUntilChanged()
            )
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

    // Add a new selector for PDB mapping
    getPdbMapping$() {
        return this.state$.pipe(map(state => state.input.pdbMapping));
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
            },
            pagination: {
                ...this.state$.value.pagination,
                currentPage: 1 // Reset to first page when new results arrive
            }
        });
    }

    // Specific actions (using the new grouped setters)
    setSelectedResult(result: SuperpositionData | null) {
        this.state$.next({
            ...this.state$.value,
            results: {
                ...this.state$.value.results,
                selectedResult: result
            },
            lastProcessedMVSResult: result?.object_id ?? null
        });
    }

    setValidationError(error: string | null) {
        this.setSearchStatus({ validationError: error });
    }

    async triggerSearch(query: string, searchType: SearchType) {
        // Clear results and set searching state immediately
        this.state$.next({
            ...this.state$.value,
            input: {
                ...this.state$.value.input,
                query,
                searchType,
                pdbMapping: null // Reset mapping
            },
            results: {
                items: [],
                selectedResult: null
            },
            status: {
                isSearching: true,
                validationError: null
            }
        });

        try {
            if (searchType === 'alphafind') {
                // First determine input type
                const inputType = await determineInputType(query);
                
                if (inputType === 'invalid') {
                    // Keep results cleared and set error
                    this.state$.next({
                        ...this.state$.value,
                        results: {
                            items: [],
                            selectedResult: null
                        },
                        status: {
                            isSearching: false,
                            validationError: 'Invalid input: Not a valid PDB ID or UniProt ID'
                        }
                    });
                    return;
                }

                let searchQuery = query;
                let pdbMapping = null;
                
                if (inputType === 'pdb') {
                    // If it's a PDB ID, get UniProt mapping
                    const mapping = await getPdbToUniprotMapping(query);
                    if (mapping.uniprotIds.length === 0) {
                        // Keep results cleared and set error
                        this.state$.next({
                            ...this.state$.value,
                            results: {
                                items: [],
                                selectedResult: null
                            },
                            status: {
                                isSearching: false,
                                validationError: `No UniProt mapping found for PDB ID ${query}`
                            }
                        });
                        return;
                    }
                    // Use the first UniProt ID for search
                    searchQuery = mapping.uniprotIds[0];
                    pdbMapping = {
                        pdbId: query.toLowerCase(),
                        uniprotId: searchQuery
                    };
                }

                // Call the actual search API
                const response = await searchStructures({
                    query: searchQuery,
                    limit: 20,
                    superposition: true
                });
                
                // Only update with results if we have them
                if (response.results && response.results.length > 0) {
                    this.state$.next({
                        ...this.state$.value,
                        input: {
                            ...this.state$.value.input,
                            pdbMapping // Store the mapping if we have it
                        },
                        results: {
                            items: response.results,
                            selectedResult: null
                        },
                        status: {
                            isSearching: false,
                            validationError: null
                        }
                    });
                } else {
                    // Keep results cleared and set error
                    this.state$.next({
                        ...this.state$.value,
                        results: {
                            items: [],
                            selectedResult: null
                        },
                        status: {
                            isSearching: false,
                            validationError: 'No results found'
                        }
                    });
                }
            } else {
                // For other search types, proceed with direct search
                const response = await searchStructures({
                    query,
                    limit: 20,
                    superposition: true
                });
                
                if (response.results && response.results.length > 0) {
                    this.state$.next({
                        ...this.state$.value,
                        results: {
                            items: response.results,
                            selectedResult: null
                        },
                        status: {
                            isSearching: false,
                            validationError: null
                        }
                    });
                } else {
                    // Keep results cleared and set error
                    this.state$.next({
                        ...this.state$.value,
                        results: {
                            items: [],
                            selectedResult: null
                        },
                        status: {
                            isSearching: false,
                            validationError: 'No results found'
                        }
                    });
                }
            }
        } catch (error) {
            // Keep results cleared and set error
            this.state$.next({
                ...this.state$.value,
                results: {
                    items: [],
                    selectedResult: null
                },
                status: {
                    isSearching: false,
                    validationError: error instanceof Error ? error.message : 'An error occurred'
                }
            });
            throw error;
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

    // Add pagination actions
    setPage(page: number) {
        const totalPages = Math.ceil(this.state$.value.results.items.length / this.state$.value.pagination.itemsPerPage);
        if (page < 1 || page > totalPages) return;

        this.state$.next({
            ...this.state$.value,
            pagination: {
                ...this.state$.value.pagination,
                currentPage: page
            }
        });
    }

    // Add method to update lastProcessedMVSResult
    setLastProcessedMVSResult(resultId: string | null) {
        this.state$.next({
            ...this.state$.value,
            lastProcessedMVSResult: resultId
        });
    }
} 