import React from 'react';
import { useModel, useBehavior } from '../model';

/**
 * SearchInput component for molecular structure search
 * Provides a search interface that triggers structure loading based on PDB ID
 * 
 * @component
 * @returns {JSX.Element} The SearchInput component
 */
const SearchInput: React.FC = () => {
  const model = useModel();
  const searchState = useBehavior(model.state.search);
  const { query, isLoading } = searchState;

  const updateQuery = (newQuery: string) => {
    model.state.search.next({
      ...searchState,
      query: newQuery
    });
  };

  return (
    <div className="search-container">
      <div className="form-group">
        <label htmlFor="structure-search">Structure Search</label>
        <input
          id="structure-search"
          className="search-input form-control"
          type="text"
          placeholder="Enter PDB ID (e.g., 1cbs, 1og2)..."
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && model.searchStructure()}
          disabled={isLoading}
        />
      </div>
      <button 
        className="search-button" 
        onClick={model.searchStructure} 
        disabled={isLoading || !query.trim()}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
};

export default SearchInput; 