import React from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { StoryAtom, CurrentViewAtom } from '../mvs/atoms';
import { createSuperpositionTemplateStory } from '../mvs/examples/superposition';
import { SearchInputStateAtom, SearchQueryInputAtom } from './atoms';
import { performSearch, updateSearchType } from './actions';
import { SearchType } from './types';

interface SearchInputProps {
    className?: string;
}

export function SearchInput({ className = '' }: SearchInputProps) {
    const [inputValue, setInputValue] = useAtom(SearchQueryInputAtom);
    const { isDisabled, error, searchType } = useAtomValue(SearchInputStateAtom);
    const setStory = useSetAtom(StoryAtom);
    const setCurrentView = useSetAtom(CurrentViewAtom);

    const handleSearch = async (searchType: SearchType) => {
        try {
            updateSearchType(searchType);
            
            const searchResponse = await performSearch({
                inputValue,
                inputType: null, // Will be determined during search
                searchType,
                options: {
                    limit: 10,
                    superposition: true
                }
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
            // Error state is handled by the performSearch action
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
                            handleSearch('alphafind');
                        }
                    }}
                    placeholder="Enter PDB ID or UniProt ID..."
                    className="search-input"
                    disabled={isDisabled}
                />
            </div>
            {error && (
                <div className="search-error">
                    {error}
                </div>
            )}
            <div className="search-buttons">
                <button
                    onClick={() => handleSearch('alphafind')}
                    className="search-button"
                    disabled={isDisabled}
                >
                    {isDisabled ? 'Searching...' : 'AlphaFind Search'}
                </button>
                <button
                    onClick={() => handleSearch('foldseek')}
                    className="search-button"
                    disabled={isDisabled}
                >
                    {isDisabled ? 'Searching...' : 'Foldseek Search'}
                </button>
            </div>
            <div className="search-hint">
                Enter a PDB ID or UniProt ID to find similar structures
            </div>
        </div>
    );
}

export default SearchInput; 