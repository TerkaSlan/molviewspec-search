import React, { useState } from 'react';
import { useSearch } from './hooks/useSearch';
import { useSetAtom } from 'jotai';
import { StoryAtom, CurrentViewAtom } from '../mvs/atoms';
import { createSuperpositionTemplateStory } from '../mvs/examples/superposition';
import { getPdbToUniprotMapping, determineInputType, getUniprotData } from '../mapping/api';

interface SearchInputProps {
  className?: string;
}

export function SearchInput({ className = '' }: SearchInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { search } = useSearch();
  const setStory = useSetAtom(StoryAtom);
  const setCurrentView = useSetAtom(CurrentViewAtom);

  const validateAndProcessInput = async () => {
    if (!inputValue.trim()) {
      setValidationError('Please enter a PDB ID or UniProt ID');
      return null;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const inputType = await determineInputType(inputValue.trim());
      
      if (inputType === 'invalid') {
        setValidationError('Invalid input: Please enter a valid PDB ID or UniProt ID');
        return null;
      }

      return inputType;
    } catch (error) {
      setValidationError('Error validating input');
      console.error('Validation error:', error);
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  const getUniprotId = async (inputType: 'pdb' | 'uniprot', input: string): Promise<string> => {
    if (inputType === 'uniprot') {
      return input;
    }
    
    // Convert PDB ID to UniProt ID
    const mapping = await getPdbToUniprotMapping(input);
    if (mapping.uniprotIds.length === 0) {
      throw new Error('No UniProt mapping found for this PDB ID');
    }
    return mapping.uniprotIds[0];
  };

  const handleAlphaFindSearch = async () => {
    const inputType = await validateAndProcessInput();
    if (!inputType) return;
    
    try {
      // Get UniProt ID regardless of input type
      const uniprotId = await getUniprotId(inputType, inputValue);
      
      // Search with UniProt ID
      const searchResponse = await search({
        query: uniprotId,
        limit: 10,
        superposition: true
      });

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
      setValidationError('Search failed. Please try again.');
    }
  };

  const handleFoldseekSearch = async () => {
    const inputType = await validateAndProcessInput();
    if (!inputType) return;
    
    try {
      // Get UniProt ID regardless of input type
      const uniprotId = await getUniprotId(inputType, inputValue);
      
      // Get sequence data from UniProt
      const uniprotData = await getUniprotData(uniprotId);
      console.log('Sequence for Foldseek:', uniprotData.sequence.value);
      
      // TODO: Implement actual Foldseek search once API is ready
    } catch (error) {
      console.error('Foldseek search failed:', error);
      setValidationError('Foldseek search failed. Please try again.');
    }
  };

  return (
    <div className={`search-box ${className}`}>
      <div className="search-input-container">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setValidationError(null);
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAlphaFindSearch();
            }
          }}
          placeholder="Enter PDB ID or UniProt ID..."
          className="search-input"
          disabled={isValidating}
        />
      </div>
      {validationError && (
        <div className="search-error">
          {validationError}
        </div>
      )}
      <div className="search-buttons">
        <button
          onClick={handleAlphaFindSearch}
          className="search-button"
          disabled={isValidating}
        >
          {isValidating ? 'Validating...' : 'AlphaFind Search'}
        </button>
        <button
          onClick={handleFoldseekSearch}
          className="search-button"
          disabled={isValidating}
        >
          {isValidating ? 'Validating...' : 'Foldseek Search'}
        </button>
      </div>
      <div className="search-hint">
        Enter a PDB ID or UniProt ID to find similar structures
      </div>
    </div>
  );
}

export default SearchInput; 