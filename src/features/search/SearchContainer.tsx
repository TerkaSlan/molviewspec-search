import React from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { StoryAtom, CurrentViewAtom } from '../mvs/atoms';
import { createMultiSceneStory } from '../mvs/examples/superposition';
import { SearchInputStateAtom, SearchQueryInputAtom, AlphaFindStateAtom, FoldseekStateAtom, ValidationStateAtom } from './atoms';
import { performSearch, updateSearchType } from './actions';
import { SearchType } from './types';
import { useFoldseek } from './hooks/useFoldseek';
import { SearchInput } from './ui/SearchInput';
import { defaultQuery } from './examples/preloaded';
import { determineInputType } from '../mapping/api';

export function SearchContainer() {
    const [inputValue, setInputValue] = useAtom(SearchQueryInputAtom);
    const { isAlphaFindDisabled, isFoldseekDisabled, error, searchType } = useAtomValue(SearchInputStateAtom);
    const setAlphaFindState = useSetAtom(AlphaFindStateAtom);
    const setFoldseekState = useSetAtom(FoldseekStateAtom);
    const setValidationState = useSetAtom(ValidationStateAtom);
    const setStory = useSetAtom(StoryAtom);
    const setCurrentView = useSetAtom(CurrentViewAtom);
    const { getFastaSequence } = useFoldseek();

    const handleSearch = async (searchType: SearchType) => {
        try {
            // Set validation state to loading
            setValidationState({
                isValidating: true,
                error: null
            });

            // Validate input first
            const inputType = await determineInputType(inputValue.trim());
            if (inputType === 'invalid') {
                setValidationState({
                    isValidating: false,
                    error: 'Invalid input: Please enter a valid PDB ID or UniProt ID'
                });
                return; // Stop here if validation fails
            }

            // Clear validation state and proceed with search
            setValidationState({
                isValidating: false,
                error: null
            });

            updateSearchType(searchType);
            
            // Set the appropriate state to loading
            const setSearchState = searchType === 'alphafind' ? setAlphaFindState : setFoldseekState;
            setSearchState(prev => ({
                ...prev,
                status: 'loading',
                error: null,
                lastUpdated: Date.now()
            }));

            // If it's a Foldseek search, first get the FASTA sequence
            if (searchType === 'foldseek') {
                const fastaSequence = await getFastaSequence(inputValue);
                console.log('FASTA sequence for Foldseek search:', fastaSequence);
            }
            
            else {
                const searchResponse = await performSearch({
                    inputValue,
                    inputType: null, // Will be determined during search
                    searchType,
                    options: {
                        limit: 10,
                        superposition: true
                    }
                });

                // Create story with all results
                if (searchResponse.results && searchResponse.results.length > 0) {
                    const newStory = createMultiSceneStory(inputValue, searchResponse.results);
                    setStory(newStory);
                    setCurrentView({ 
                        type: 'scene', 
                        id: newStory.scenes[0].id, 
                        subview: '3d-view' 
                    });
                }

                // Update the appropriate state with results
                setSearchState(prev => ({
                    ...prev,
                    status: 'success',
                    results: searchResponse.results || [],
                    error: null,
                    lastUpdated: Date.now()
                }));
            }
        } catch (error) {
            console.error('Search failed:', error);
            // Update the appropriate state with error
            const setSearchState = searchType === 'alphafind' ? setAlphaFindState : setFoldseekState;
            setSearchState(prev => ({
                ...prev,
                status: 'error',
                error: {
                    code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
                    message: error instanceof Error ? error.message : 'An unknown error occurred'
                },
                lastUpdated: Date.now()
            }));
        }
    };

    return (
        <SearchInput
            value={inputValue}
            onChange={setInputValue}
            onSearch={handleSearch}
            isAlphaFindDisabled={isAlphaFindDisabled}
            isFoldseekDisabled={isFoldseekDisabled}
            error={error}
            searchType={searchType}
        />
    );
} 