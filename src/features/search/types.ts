export interface AlphaFindStructure {
    object_id: string;
    tm_score: number;
    rmsd: number;
    aligned_percentage: number;
    sequence_aligned_percentage: number;
    rotation_matrix?: number[][] | number[][][];
    translation_vector?: number[] | number[][];
}

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
    onProgress?: (status: SearchProgressInfo) => void;
    onPartialResults?: (data: AlphaFindResponse) => void;
} 