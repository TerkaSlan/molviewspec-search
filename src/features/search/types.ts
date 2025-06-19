export interface SuperpositionData {
    object_id: string;
    aligned_percentage: number;
    rmsd: number;
    rotation_matrix: number[][];
    translation_vector: number[];
    sequence_aligned_percentage: number;
    tm_score: number;
    tm_score_target: number;
}

export interface AlphaFindStructure extends SuperpositionData {}

export interface AlphaFindResponse {
    results?: AlphaFindStructure[];
    search_time?: number;
    queue_position?: number;
    message?: string;
    query?: string;
    isPartialResult?: boolean;
    isComplete?: boolean;
}

export interface SearchProgressInfo {
    stage: 'initializing' | 'queued' | 'processing' | 'completed';
    queuePosition?: number;
    estimatedWaitTime?: number;
    attempt: number;
    maxAttempts: number;
    message: string;
    partialResultsCount?: number;
}

export interface AlphaFindSearchState {
    query: string;
    results: AlphaFindStructure[];
    isSearching: boolean;
    error: string | null;
    progress: SearchProgressInfo | null;
}

export interface AlphaFindSearchOptions {
    query: string;
    limit?: number;
    maxRetries?: number;
    initialBackoffMs?: number;
    superposition?: boolean;
    onProgress?: (status: SearchProgressInfo | null) => void;
    onPartialResults?: (data: AlphaFindResponse) => void;
}

export type SearchStatus = 'idle' | 'validating' | 'loading' | 'success' | 'error';
export type SearchType = 'alphafind' | 'foldseek';

export interface SearchQuery {
    inputValue: string;
    inputType: 'pdb' | 'uniprot' | null;
    searchType: SearchType;
    options: {
        limit: number;
        superposition: boolean;
    };
}

export interface SearchError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

export interface SearchState {
    status: SearchStatus;
    query: SearchQuery | null;
    results: AlphaFindStructure[];
    error: SearchError | null;
    progress: SearchProgressInfo | null;
    lastUpdated: number | null;
}

export interface SearchValidationState {
    isValidating: boolean;
    error: string | null;
}

export interface SearchOptions extends Partial<AlphaFindSearchOptions> {
    searchType: SearchType;
    inputType?: 'pdb' | 'uniprot';
    fastaSequence?: string;
}

export interface FoldseekSearchOptions extends AlphaFindSearchOptions {
    searchType: 'foldseek';
    fastaSequence?: string;
} 