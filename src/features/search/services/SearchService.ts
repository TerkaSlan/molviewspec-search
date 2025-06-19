import { filter, distinctUntilChanged } from 'rxjs/operators';
import { globalStateService } from '../../../lib/state/GlobalStateService';
import { SearchType, SuperpositionData } from '../types';
import { determineInputType, getPdbToUniprotMapping, getUniprotData } from '../../mapping/api';
import { searchStructures } from '../api';
import { preloadedResults, defaultQuery } from '../examples/preloaded';


class SearchService {
    private static instance: SearchService;
    private currentSearch: Promise<void> | null = null;

    private constructor() {
        // Load preloaded results on startup
        globalStateService.setSearchQuery(defaultQuery, 'alphafind');
        globalStateService.setSearchResults(preloadedResults.results as SuperpositionData[]);
        if (preloadedResults.results.length > 0) {
            globalStateService.setSelectedResult(preloadedResults.results[0] as SuperpositionData);
        }

        // Subscribe to search query changes
        globalStateService.getSearchState$()
            .pipe(
                filter(state => state.isSearching),
                distinctUntilChanged((prev, curr) => 
                    prev.query === curr.query && prev.searchType === curr.searchType
                )
            )
            .subscribe(async state => {
                if (!state.query || !state.searchType) return;
                await this.search(state.query, state.searchType);
            });
    }

    public static getInstance(): SearchService {
        if (!SearchService.instance) {
            SearchService.instance = new SearchService();
        }
        return SearchService.instance;
    }

    private async validateInput(input: string): Promise<'pdb' | 'uniprot'> {
        try {
            if (!input || !input.trim()) {
                throw new Error('Please enter a PDB ID or UniProt ID');
            }

            const inputType = await determineInputType(input.trim());
            
            if (inputType === 'invalid') {
                throw new Error('Invalid input: Please enter a valid PDB ID or UniProt ID');
            }

            return inputType;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error validating input';
            // Clear all search-related state when validation fails
            globalStateService.clearSearch();
            globalStateService.setValidationError(errorMessage);
            throw error;
        }
    }

    private async resolveUniprotId(inputType: 'pdb' | 'uniprot', input: string): Promise<string> {
        if (inputType === 'uniprot') {
            return input;
        }
        
        const mapping = await getPdbToUniprotMapping(input);
        if (mapping.uniprotIds.length === 0) {
            throw new Error('No UniProt mapping found for this PDB ID');
        }
        return mapping.uniprotIds[0];
    }


    public async search(query: string, searchType: SearchType): Promise<void> {
        // If there's already a search in progress, wait for it to complete
        if (this.currentSearch) {
            await this.currentSearch;
        }

        // Start new search
        this.currentSearch = this.performSearch(query, searchType);

        try {
            await this.currentSearch;
        } finally {
            this.currentSearch = null;
        }
    }

    private async performSearch(query: string, searchType: SearchType): Promise<void> {
        try {
            // Clear previous results and errors, but keep the query
            globalStateService.setValidationError(null);
            globalStateService.setSearchResults([]);
            globalStateService.setSelectedResult(null);
            
            // Validate input
            const inputType = await this.validateInput(query);
            const uniprotId = await this.resolveUniprotId(inputType, query);

            // Handle different search types
            if (searchType === 'foldseek') {
                const uniprotData = await getUniprotData(uniprotId);
                // TODO: Implement Foldseek search
                throw new Error('Foldseek search not implemented yet');
            }

            // Perform search
            const response = await searchStructures({
                query: uniprotId,
                limit: 10,
                superposition: true
            });

            // Update results and automatically select the first result
            const searchResults = response.results || [];
            globalStateService.setSearchResults(searchResults as SuperpositionData[]);
            if (searchResults.length > 0) {
                globalStateService.setSelectedResult(searchResults[0] as SuperpositionData);
            }
        } catch (error) {
            console.error('Search failed:', error);
            // Clear all search-related state when search fails
            globalStateService.clearSearch();
            globalStateService.setValidationError(error instanceof Error ? error.message : 'Search failed');
        }
    }
}

// Export singleton instance
export const searchService = SearchService.getInstance(); 