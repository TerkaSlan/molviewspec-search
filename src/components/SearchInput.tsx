import React from 'react';
import { useAtom } from 'jotai';
import { SearchAtom } from '../app/state/atoms';

/**
 * SearchInput component for molecular structure search
 * Provides a search interface that triggers structure loading based on PDB ID
 * 
 * @component
 * @returns {JSX.Element} The SearchInput component
 */
const SearchInput: React.FC = () => {
  const [searchState, setSearchState] = useAtom(SearchAtom);
  const { query, isLoading } = searchState;

  const updateQuery = (newQuery: string) => {
    setSearchState({
      ...searchState,
      query: newQuery
    });
  };

  const handleSearch = () => {
    if (!query.trim() || isLoading) return;
    
    setSearchState({
      ...searchState,
      isLoading: true,
      error: null
    });

    // For now, we'll just simulate a search delay
    setTimeout(() => {
      setSearchState({
        ...searchState,
        isLoading: false
      });
    }, 1000);
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
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          disabled={isLoading}
        />
      </div>
      <button 
        className="search-button" 
        onClick={handleSearch} 
        disabled={isLoading || !query.trim()}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
};

export default SearchInput; 