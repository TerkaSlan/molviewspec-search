import React, { useState } from 'react';
import { useSearch } from './hooks/useSearch';
import { useSetAtom } from 'jotai';
import { StoryAtom, CurrentViewAtom } from '../mvs/atoms';
import { createTemplateStory } from '../mvs/examples/default';

interface SearchInputProps {
  className?: string;
}

export function SearchInput({ className = '' }: SearchInputProps) {
  const [inputValue, setInputValue] = useState('');
  const { search } = useSearch();
  const setStory = useSetAtom(StoryAtom);
  const setCurrentView = useSetAtom(CurrentViewAtom);

  const handleSearch = async () => {
    try {
      // Create a new story based on the search query
      const newStory = createTemplateStory(inputValue);
      setStory(newStory);
      setCurrentView({ 
        type: 'scene', 
        id: newStory.scenes[0].id, 
        subview: '3d-view' 
      });

      // Perform AlphaFind search
      await search({
        query: inputValue,
        limit: 10,
        superposition: true
      });
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