import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { StoryAtom, CurrentViewAtom } from '../mvs/atoms';
import { createSuperpositionTemplateStory } from '../mvs/examples/superposition';
import { SearchResultsStateAtom } from './atoms';
import { SearchProgressInfo, SuperpositionData } from './types';

function SearchProgress({ progress }: { progress: SearchProgressInfo | null }) {
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

function SearchError({ error }: { error: { message: string } | null }) {
    if (!error) return null;

    return (
        <div className="search-error">
            {error.message}
        </div>
    );
}

function ResultsTable({ results, onResultClick }: { 
    results: SuperpositionData[],
    onResultClick: (superpositionData: SuperpositionData) => void 
}) {
    return (
        <div className="results-table-container">
            <table className="results-table">
                <thead>
                    <tr>
                        <th>Similar proteins</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((result, index) => (
                        <tr 
                            key={result.object_id} 
                            className={`${index % 2 === 0 ? 'row-even' : 'row-odd'} cursor-pointer hover:bg-gray-200 transition-colors duration-150 ease-in-out`}
                            onClick={() => onResultClick(result)}
                            style={{ cursor: 'pointer' }}
                        >
                            <td className="px-4 py-2 hover:underline">
                                {result.object_id} 
                                <span className="text-sm text-gray-500 ml-2">
                                    (RMSD: {result.rmsd.toFixed(2)}, TM-score: {result.tm_score.toFixed(3)})
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function SearchResults() {
    const {
        results,
        error,
        progress,
        query,
        isEmpty,
        hasResults
    } = useAtomValue(SearchResultsStateAtom);
    
    const setStory = useSetAtom(StoryAtom);
    const setCurrentView = useSetAtom(CurrentViewAtom);

    const handleResultClick = (superpositionData: SuperpositionData) => {
        if (!query) return;
        
        const newStory = createSuperpositionTemplateStory(query.inputValue, superpositionData);
        setStory(newStory);
        setCurrentView({ 
            type: 'scene', 
            id: newStory.scenes[0].id, 
            subview: '3d-view' 
        });
    };

    if (isEmpty) {
        return null;
    }

    return (
        <div className="search-results">
            <SearchProgress progress={progress} />
            <SearchError error={error} />
            
            {hasResults && <ResultsTable results={results} onResultClick={handleResultClick} />}
        </div>
    );
}

export default SearchResults; 