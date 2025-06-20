import React, { useCallback, useMemo } from 'react';
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

const Pagination = React.memo(function Pagination({ model }: PaginationProps) {
    const tableData = useObservable(model.selectors.results.tableData(), {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        items: [],
        emptyRowsCount: 0
    });

    // Debug state updates
    React.useEffect(() => {
        console.log('[Pagination] State Update:', {
            currentPage: tableData.currentPage,
            totalPages: tableData.totalPages,
            totalItems: tableData.totalItems
        });
    }, [tableData]);

    const handlePrevPage = useCallback(() => {
        const newPage = tableData.currentPage - 1;
        if (newPage >= 1) {
            console.log('[Pagination] Moving to previous page:', newPage);
            model.setPage(newPage);
        }
    }, [tableData.currentPage, model]);

    const handleNextPage = useCallback(() => {
        const newPage = tableData.currentPage + 1;
        if (newPage <= tableData.totalPages) {
            console.log('[Pagination] Moving to next page:', newPage);
            model.setPage(newPage);
        }
    }, [tableData.currentPage, tableData.totalPages, model]);

    // Don't render if we don't need pagination
    if (tableData.totalItems <= 5 || tableData.totalPages <= 1) {
        return null;
    }

    return (
        <div className="pagination">
            <button
                onClick={handlePrevPage}
                disabled={tableData.currentPage <= 1}
                className="pagination-button"
                type="button"
            >
                Previous
            </button>
            <span className="pagination-info">
                Page {tableData.currentPage} of {tableData.totalPages}
            </span>
            <button
                onClick={handleNextPage}
                disabled={tableData.currentPage >= tableData.totalPages}
                className="pagination-button"
                type="button"
            >
                Next
            </button>
        </div>
    );
}, (prevProps, nextProps) => {
    // Implement custom comparison for memo
    return prevProps.model === nextProps.model;
});

interface ResultsTableProps {
    results: SuperpositionData[];
    onResultClick: (result: SuperpositionData) => void;
    model: MVSModel;
    searchModel: SearchModel;
}

const ResultsTable = React.memo(function ResultsTable({ onResultClick, model, searchModel }: ResultsTableProps) {
    const currentSceneKey = useObservable(model.selectors.story.currentScene(), null);
    const selectedResult = useObservable(model.selectors.viewer.selectedResult(), null);
    const tableData = useObservable(searchModel.selectors.results.tableData(), {
        items: [],
        emptyRowsCount: 0,
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
    });

    const tableRows = useMemo(() => {
        return tableData.items.map((result) => {
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
        });
    }, [tableData.items, currentSceneKey, selectedResult, onResultClick]);

    const emptyRows = useMemo(() => {
        return Array.from({ length: tableData.emptyRowsCount }).map((_, index) => (
            <tr key={`empty-${index}`} className="empty-row">
                <td colSpan={4}></td>
            </tr>
        ));
    }, [tableData.emptyRowsCount]);
    
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
                    {tableRows}
                    {emptyRows}
                </tbody>
            </table>
            <Pagination model={searchModel} />
        </div>
    );
});

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

export const SearchResults = React.memo(function SearchResults({
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
}); 