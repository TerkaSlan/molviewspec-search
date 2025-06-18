import React from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { StoryAtom, CurrentViewAtom } from '../mvs/atoms';
import { createMultiSceneStory } from '../mvs/examples/superposition';
import { SearchInputStateAtom, SearchQueryInputAtom } from './atoms';
import { performSearch, updateSearchType } from './actions';
import { SearchType } from './types';
import { useFoldseek } from './hooks/useFoldseek';
import { SearchInput } from './ui/SearchInput';
import { defaultQuery } from './examples/preloaded';

export function SearchContainer() {
    const [inputValue, setInputValue] = useAtom(SearchQueryInputAtom);
    const { isDisabled, error, searchType } = useAtomValue(SearchInputStateAtom);
    const setStory = useSetAtom(StoryAtom);
    const setCurrentView = useSetAtom(CurrentViewAtom);
    const { getFastaSequence } = useFoldseek();

    const handleSearch = async (searchType: SearchType) => {
        // Don't trigger a new search if we're using the default query
        if (inputValue === defaultQuery) {
            return;
        }

        try {
            updateSearchType(searchType);
            
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
            }
        } catch (error) {
            console.error('Search failed:', error);
            // Error state is handled by the performSearch action
        }
    };

    return (
        <SearchInput
            value={inputValue}
            onChange={setInputValue}
            onSearch={handleSearch}
            isDisabled={isDisabled}
            error={error}
            searchType={searchType}
        />
    );
} 