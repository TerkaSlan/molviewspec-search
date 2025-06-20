import React from 'react';
import { SearchProgressInfo, SuperpositionData } from '../types';
import { useObservable } from '../../../lib/hooks/use-observable';
import { MVSModel } from '../../mvs/models/MVSModel';
import { SearchModel } from '../models/SearchModel';

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

interface PaginationProps {
    model: SearchModel;
}

function Pagination({ model }: PaginationProps) {
    const currentPage = useObservable(model.selectors.pagination.currentPage(), 1);
    const totalPages = useObservable(model.selectors.pagination.totalPages(), 1);

    if (totalPages <= 1) return null;

    return (
        <div className="pagination">
            <button
                onClick={() => model.setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
            >
                Previous
            </button>
            <span className="pagination-info">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => model.setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
            >
                Next
            </button>
        </div>
    );
}

interface ResultsTableProps {
    results: SuperpositionData[];
    onResultClick: (result: SuperpositionData) => void;
    model: MVSModel;
    searchModel: SearchModel;
}

function ResultsTable({ results, onResultClick, model, searchModel }: ResultsTableProps) {
    // Subscribe to both scene and selection changes from the MVS model
    const currentSceneKey = useObservable(model.selectors.story.currentScene(), null);
    const selectedResult = useObservable(model.selectors.viewer.selectedResult(), null);
    const paginatedResults = useObservable(searchModel.selectors.results.paginatedItems(), []);
    const itemsPerPage = useObservable(searchModel.selectors.pagination.itemsPerPage(), 7);
    
    // Calculate number of empty rows needed
    const emptyRowsCount = Math.max(0, itemsPerPage - paginatedResults.length);
    
    // Debug state in ResultsTable
    React.useEffect(() => {
        console.log('[ResultsTable] MVS Model State Update:', {
            currentSceneKey,
            selectedResultId: selectedResult?.object_id,
            resultIds: results.map(r => r.object_id),
            modelInstance: model,
            emptyRowsCount
        });
    }, [currentSceneKey, selectedResult, results, model, emptyRowsCount]);
    
    return (
        <div className="results-container">
            <table className="results-table">
                <thead>
                    <tr>
                        <th>Protein ID</th>
                        <th>TM-score</th>
                        <th>RMSD</th>
                        <th>Aligned</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedResults.map((result) => {
                        const sceneKey = `scene_${result.object_id}`;
                        const isActive = currentSceneKey === sceneKey || selectedResult?.object_id === result.object_id;
                        
                        return (
                            <tr
                                key={result.object_id}
                                className={`result-row ${isActive ? 'active' : ''}`}
                                onClick={() => onResultClick(result)}
                            >
                                <td className="protein-id">{result.object_id}</td>
                                <td className="tm-score">{result.tm_score.toFixed(3)}</td>
                                <td className="rmsd">{result.rmsd.toFixed(3)}</td>
                                <td className="aligned">{(result.aligned_percentage * 100).toFixed(1)}%</td>
                            </tr>
                        );
                    })}
                    {/* Add empty rows to maintain consistent height */}
                    {Array.from({ length: emptyRowsCount }).map((_, index) => (
                        <tr key={`empty-${index}`} className="empty-row">
                            <td colSpan={4}></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination model={searchModel} />
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
    model: MVSModel;
    searchModel: SearchModel;
}

export function SearchResults({
    results,
    error,
    progress,
    isEmpty,
    hasResults,
    onResultClick,
    model,
    searchModel
}: SearchResultsProps) {
    if (isEmpty) {
        return null;
    }

    return (
        <div className="search-results">
            <SearchProgress progress={progress} />
            {hasResults && <ResultsTable results={results} onResultClick={onResultClick} model={model} searchModel={searchModel} />}
        </div>
    );
} 