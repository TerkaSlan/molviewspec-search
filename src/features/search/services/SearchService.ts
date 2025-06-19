import { filter } from 'rxjs/operators';
import { globalStateService } from '../../../lib/state/GlobalStateService';
import { SearchType, SuperpositionData, SearchProgressInfo } from '../types';
import { determineInputType, getPdbToUniprotMapping, getUniprotData } from '../../mapping/api';
import { API_BASE_URL } from '../state';

const MIN_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 10000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_INITIAL_BACKOFF_MS = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class SearchService {
    private static instance: SearchService;

    private constructor() {
        // Subscribe to search query changes
        globalStateService.getSearchState$()
            .pipe(
                filter(state => state.isSearching)
            )
            .subscribe(async state => {
                if (!state.query || !state.searchType) return;
                await this.performSearch(state.query, state.searchType);
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
            const inputType = await determineInputType(input.trim());
            
            if (inputType === 'invalid') {
                throw new Error('Invalid input: Please enter a valid PDB ID or UniProt ID');
            }

            return inputType;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error validating input';
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

    private async searchStructures(
        query: string,
        searchType: SearchType,
        options: { limit?: number; superposition?: boolean } = {}
    ): Promise<SuperpositionData[]> {
        let retryCount = 0;
        let backoffMs = DEFAULT_INITIAL_BACKOFF_MS;

        const reportProgress = (
            stage: SearchProgressInfo['stage'],
            queuePosition?: number,
            message = ''
        ) => {
            globalStateService.setSearchProgress({
                stage,
                queuePosition,
                attempt: retryCount + 1,
                maxAttempts: DEFAULT_MAX_RETRIES,
                message
            });
        };

        while (retryCount < DEFAULT_MAX_RETRIES) {
            try {
                const baseUrl = `${API_BASE_URL}/search?query=${encodeURIComponent(query)}&limit=${options.limit || 10}`;
                const apiUrl = options.superposition ? `${baseUrl}&superposition=True` : baseUrl;
                
                reportProgress('initializing');
                
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    },
                    mode: 'cors'
                });

                if (!response.ok) {
                    reportProgress('processing', undefined, `Search attempt encountered HTTP ${response.status}. Retrying...`);
                    backoffMs = Math.min(MIN_BACKOFF_MS * 2, MAX_BACKOFF_MS);
                    await delay(backoffMs);
                    retryCount++;
                    continue;
                }

                const data = await response.json();

                if (data.queue_position !== undefined) {
                    reportProgress('queued', data.queue_position, `Queued at position ${data.queue_position}`);
                    await delay(backoffMs);
                    retryCount++;
                    continue;
                }

                if (data.results && Array.isArray(data.results) && data.results.length > 0) {
                    return data.results;
                }

                reportProgress('processing', undefined, 'No results found, retrying...');
                await delay(backoffMs);
                retryCount++;
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error occurred';
                reportProgress('processing', undefined, `Error: ${message}`);
                await delay(backoffMs);
                retryCount++;
            }
        }

        throw new Error(`Search failed after ${DEFAULT_MAX_RETRIES} attempts`);
    }

    private async performSearch(query: string, searchType: SearchType): Promise<void> {
        try {
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
            const results = await this.searchStructures(uniprotId, searchType, {
                limit: 10,
                superposition: true
            });

            // Update results and automatically select the first result
            globalStateService.setSearchResults(results);
            if (results.length > 0) {
                globalStateService.setSelectedResult(results[0]);
            }
        } catch (error) {
            console.error('Search failed:', error);
            globalStateService.setValidationError(error instanceof Error ? error.message : 'Search failed');
        }
    }
}

// Export singleton instance
export const searchService = SearchService.getInstance(); 