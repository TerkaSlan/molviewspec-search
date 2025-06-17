import React from 'react';
import { useAtomValue } from 'jotai';
import { SearchStateAtom, SearchProgressAtom, SearchErrorAtom } from './state';
import { SearchProgressInfo } from './types';

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

function SearchError({ error }: { error: string | null }) {
  if (!error) return null;

  return (
    <div className="search-error">
      {error}
    </div>
  );
}

function ResultsTable({ results }: { results: Array<{ object_id: string }> }) {
  return (
    <div className="results-table-container">
      <div className="results-header">Search Results</div>
      <table className="results-table">
        <thead>
          <tr>
            <th>Object ID</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={result.object_id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
              <td>{result.object_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SearchResults() {
  const { results, isSearching } = useAtomValue(SearchStateAtom);
  const progress = useAtomValue(SearchProgressAtom);
  const error = useAtomValue(SearchErrorAtom);

  if (!isSearching && results.length === 0 && !error) {
    return null;
  }

  return (
    <div className="search-results">
      <SearchProgress progress={progress} />
      <SearchError error={error} />
      
      {results.length > 0 && <ResultsTable results={results} />}
    </div>
  );
}

export default SearchResults; 