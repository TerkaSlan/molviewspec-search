import React from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { SearchAtom, CurrentStoryAtom } from '../app/state/atoms';

/**
 * SearchInput component for molecular structure search
 * Provides a search interface that triggers structure loading based on PDB ID
 * 
 * @component
 * @returns {JSX.Element} The SearchInput component
 */
const SearchInput: React.FC = () => {
  const [searchState, setSearchState] = useAtom(SearchAtom);
  const setCurrentStory = useSetAtom(CurrentStoryAtom);
  const { query, isLoading } = searchState;

  const updateQuery = (newQuery: string) => {
    setSearchState({
      ...searchState,
      query: newQuery
    });
  };

  const handleSearch = async () => {
    if (!query.trim() || isLoading) return;
    
    setSearchState({
      ...searchState,
      isLoading: true,
      error: null
    });

    try {
      // Update the current story with the new PDB ID
      setCurrentStory(query.trim().toLowerCase());
      
      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }));
    }
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