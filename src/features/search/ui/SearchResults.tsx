import React from 'react';
import { SearchProgressInfo, SuperpositionData } from '../types';

interface SearchProgressProps {
    progress: SearchProgressInfo | null;
}

function SearchProgress({ progress }: SearchProgressProps) {
    if (!progress) return null;

    return (
        <div className="search-progress">
            <div className="progress-content">
                <span className="progress-message">
                    {progress.stage === 'queued' && progress.queuePosition !== undefined
                        ? `Queue position: ${progress.queuePosition}`
                        : progress.message}
                </span>
                {progress.stage !== 'completed' && (
                    <span className="progress-attempt">
                        Attempt {progress.attempt} of {progress.maxAttempts}
                    </span>
                )}
            </div>
            {progress.partialResultsCount !== undefined && progress.partialResultsCount > 0 && (
                <div className="progress-count">
                    Found {progress.partialResultsCount} structures so far
                </div>
            )}
        </div>
    );
}

interface SearchErrorProps {
    error: { message: string } | null;
}

function SearchError({ error }: SearchErrorProps) {
    if (!error) return null;

    return (
        <div className="search-error">
            {error.message}
        </div>
    );
}

interface ResultsTableProps {
    results: SuperpositionData[];
    onResultClick: (result: SuperpositionData) => void;
}

function ResultsTable({ results, onResultClick }: ResultsTableProps) {
    return (
        <div className="results-table">
            {results.map((result, index) => (
                <div
                    key={result.object_id}
                    className="result-row"
                    onClick={() => onResultClick(result)}
                >
                    <div className="result-index">{index + 1}</div>
                    <div className="result-id">{result.object_id}</div>
                    <div className="result-stats">
                        <span>TM-score: {result.tm_score.toFixed(3)}</span>
                        <span>RMSD: {result.rmsd.toFixed(3)}</span>
                        <span>Aligned: {(result.aligned_percentage * 100).toFixed(1)}%</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

interface SearchResultsProps {
    results: SuperpositionData[];
    error: { message: string } | null;
    progress: SearchProgressInfo | null;
    isEmpty: boolean;
    hasResults: boolean;
    onResultClick: (result: SuperpositionData) => void;
}

export function SearchResults({
    results,
    error,
    progress,
    isEmpty,
    hasResults,
    onResultClick
}: SearchResultsProps) {
    if (isEmpty) {
        return null;
    }

    return (
        <div className="search-results">
            <SearchProgress progress={progress} />
            <SearchError error={error} />
            {hasResults && <ResultsTable results={results} onResultClick={onResultClick} />}
        </div>
    );
} 