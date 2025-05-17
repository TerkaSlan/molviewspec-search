import React, { useState } from 'react';
import { useModel, useBehavior } from '../model';

const SearchInput: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const model = useModel();
  const isLoading = useBehavior(model.state.isLoading);

  const handleSearch = () => {
    if (query.trim()) {
      console.log(`SearchInput: Initiating search for: ${query}`);
      model.searchStructure(query);
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
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSearch()}
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