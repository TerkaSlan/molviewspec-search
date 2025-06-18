import React, { useState } from 'react';
import { useSearch } from './hooks/useSearch';
import { useSetAtom } from 'jotai';
import { StoryAtom, CurrentViewAtom } from '../mvs/atoms';
import { createSuperpositionTemplateStory } from '../mvs/examples/superposition';

interface SearchInputProps {
  className?: string;
}

export function SearchInput({ className = '' }: SearchInputProps) {
  const [inputValue, setInputValue] = useState('');
  const { search } = useSearch();
  const setStory = useSetAtom(StoryAtom);
  const setCurrentView = useSetAtom(CurrentViewAtom);

  const handleSearch = async () => {
    if (!inputValue.trim()) return;
    
    try {
      // Perform AlphaFind search first to get results
      const searchResponse = await search({
        query: inputValue,
        limit: 10,
        superposition: true
      });

      // If we have results, create a superposition story with the first result
      if (searchResponse.results && searchResponse.results.length > 0) {
        const firstResult = searchResponse.results[0];
        const newStory = createSuperpositionTemplateStory(inputValue, firstResult);
        setStory(newStory);
        setCurrentView({ 
          type: 'scene', 
          id: newStory.scenes[0].id, 
          subview: '3d-view' 
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <div className={`search-box ${className}`}>
      <div className="search-input-container">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          placeholder="Enter PDB ID or search query..."
          className="search-input"
        />
        <button
          onClick={handleSearch}
          className="search-button"
        >
          Search
        </button>
      </div>
      <div className="search-hint">
        Enter a PDB ID or search query to find similar structures
      </div>
    </div>
  );
}

export default SearchInput; 