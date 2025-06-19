import React from 'react';
import { SearchProgressInfo, SuperpositionData } from '../types';
import { useObservable } from '../../../lib/hooks/use-observable';
import { MVSModel } from '../../mvs/models/MVSModel';

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

interface ResultsTableProps {
    results: SuperpositionData[];
    onResultClick: (result: SuperpositionData) => void;
    model: MVSModel;
}

function ResultsTable({ results, onResultClick, model }: ResultsTableProps) {
    // Subscribe to both scene and selection changes from the MVS model
    const currentSceneKey = useObservable(model.selectors.story.currentScene(), null);
    const selectedResult = useObservable(model.selectors.viewer.selectedResult(), null);
    
    // Debug state in ResultsTable
    React.useEffect(() => {
        console.log('[ResultsTable] MVS Model State Update:', {
            currentSceneKey,
            selectedResultId: selectedResult?.object_id,
            resultIds: results.map(r => r.object_id),
            modelInstance: model
        });
    }, [currentSceneKey, selectedResult, results, model]);
    
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
                    {results.map((result) => {
                        const sceneKey = `scene_${result.object_id}`;
                        // Check both scene key and selected result for active state
                        const isActive = currentSceneKey === sceneKey || selectedResult?.object_id === result.object_id;
                        
                        // Debug row state
                        console.log('[ResultsTable] Row State:', {
                            id: result.object_id,
                            sceneKey,
                            currentSceneKey,
                            selectedResultId: selectedResult?.object_id,
                            isActive,
                            matches: {
                                scene: currentSceneKey === sceneKey,
                                selected: selectedResult?.object_id === result.object_id
                            }
                        });
                        
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
                </tbody>
            </table>
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
}

export function SearchResults({
    results,
    error,
    progress,
    isEmpty,
    hasResults,
    onResultClick,
    model
}: SearchResultsProps) {
    if (isEmpty) {
        return null;
    }

    return (
        <div className="search-results">
            <SearchProgress progress={progress} />
            {hasResults && <ResultsTable results={results} onResultClick={onResultClick} model={model} />}
        </div>
    );
} 