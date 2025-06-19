import { API_BASE_URL } from './state';
import { AlphaFindResponse, AlphaFindSearchOptions, SearchProgressInfo } from './types';

const MIN_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 10000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_INITIAL_BACKOFF_MS = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function searchStructures({
    query,
    limit = 10,
    maxRetries = DEFAULT_MAX_RETRIES,
    initialBackoffMs = DEFAULT_INITIAL_BACKOFF_MS,
    superposition = false,
    onProgress,
    onPartialResults
}: AlphaFindSearchOptions): Promise<AlphaFindResponse> {
    let retryCount = 0;
    let backoffMs = initialBackoffMs;
    const receivedStructureIds = new Set<string>();
    const partialResults: AlphaFindResponse['results'] = [];

    const reportProgress = (
        stage: SearchProgressInfo['stage'],
        queuePosition?: number,
        message = '',
        partialResultsCount = partialResults.length
    ) => {
        onProgress?.({
            stage,
            queuePosition,
            attempt: retryCount + 1,
            maxAttempts: maxRetries,
            message,
            partialResultsCount
        });
    };

    while (retryCount < maxRetries) {
        try {
            const baseUrl = `${API_BASE_URL}/search?query=${encodeURIComponent(query)}&limit=${limit}`;
            const apiUrl = superposition ? `${baseUrl}&superposition=True` : baseUrl;
            
            console.log(`AlphaFind API URL: ${apiUrl} (attempt ${retryCount + 1}/${maxRetries})`);
            
            reportProgress('initializing');
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });

            console.log(`Response status: ${response.status} (attempt ${retryCount + 1}/${maxRetries})`);

            if (!response.ok) {
                console.warn(`HTTP error: ${response.status}. Retrying...`);
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
                console.log(`Found ${data.results.length} results`);
                onProgress?.(null);
                return {
                    results: data.results,
                    search_time: data.search_time || 0,
                    isComplete: true
                };
            }

            console.log('No results found in response');
            reportProgress('processing', undefined, 'No results found, retrying...');
            await delay(backoffMs);
            retryCount++;
        } catch (error) {
            console.error('Search error:', error);
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            reportProgress('processing', undefined, `Error: ${message}`);
            await delay(backoffMs);
            retryCount++;
        }
    }

    throw new Error(`Search failed after ${maxRetries} attempts`);
} 