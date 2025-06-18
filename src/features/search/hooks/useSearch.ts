import { useSetAtom, useAtom } from 'jotai';
import { useCallback } from 'react';
import { searchStructures } from '../api';
import { SearchStateAtom } from '../state';
import { RecentSearchesAtom } from '../atoms';
import { AlphaFindSearchOptions, SearchQuery, SearchError } from '../types';
import { StoryAtom, CurrentViewAtom } from '../../mvs/atoms';
import { createMultiSceneStory } from '../../mvs/examples/superposition';

const MAX_RECENT_SEARCHES = 10;

export function useSearch() {
  const setSearchState = useSetAtom(SearchStateAtom);
  const [recentSearches, setRecentSearches] = useAtom(RecentSearchesAtom);
  const setStory = useSetAtom(StoryAtom);
  const setCurrentView = useSetAtom(CurrentViewAtom);

  const search = useCallback(async (options: Omit<AlphaFindSearchOptions, 'onProgress' | 'onPartialResults'>) => {
    const searchQuery: SearchQuery = {
      inputValue: options.query,
      inputType: null,
      searchType: 'alphafind',
      options: { limit: 10, superposition: true }
    };

    // Update recent searches
    setRecentSearches((prev: SearchQuery[]) => {
      const filtered = prev.filter((q: SearchQuery) => q.inputValue !== searchQuery.inputValue);
      return [searchQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    });

    setSearchState(prev => ({
      ...prev,
      status: 'loading',
      query: searchQuery,
      error: null,
      progress: null,
      lastUpdated: Date.now()
    }));

    try {
      const response = await searchStructures({
        ...options,
        onProgress: (progress) => {
          setSearchState(prev => ({
            ...prev,
            progress,
            lastUpdated: Date.now()
          }));
        },
        onPartialResults: (data) => {
          const results = data.results || [];
          setSearchState(prev => ({
            ...prev,
            results,
            lastUpdated: Date.now()
          }));

          // Create and set story for partial results
          if (results.length > 0) {
            console.log('Creating story from partial results:', {
              queryId: options.query,
              numResults: results.length,
              firstResult: results[0]
            });
            const newStory = createMultiSceneStory(options.query, results);
            console.log('Created story:', {
              title: newStory.metadata.title,
              numScenes: newStory.scenes.length,
              firstScene: newStory.scenes[0]
            });
            setStory(newStory);
            setCurrentView({ 
              type: 'scene', 
              id: newStory.scenes[0].id, 
              subview: '3d-view' 
            });
          }
        }
      });

      const finalResults = response.results || [];
      setSearchState(prev => ({
        ...prev,
        status: 'success',
        results: finalResults,
        error: null,
        lastUpdated: Date.now()
      }));

      // Create and set final story with all results
      if (finalResults.length > 0) {
        console.log('Creating story from final results:', {
          queryId: options.query,
          numResults: finalResults.length,
          firstResult: finalResults[0]
        });
        const newStory = createMultiSceneStory(options.query, finalResults);
        console.log('Created final story:', {
          title: newStory.metadata.title,
          numScenes: newStory.scenes.length,
          firstScene: newStory.scenes[0]
        });
        setStory(newStory);
        setCurrentView({ 
          type: 'scene', 
          id: newStory.scenes[0].id, 
          subview: '3d-view' 
        });
      }

      return response;
    } catch (error) {
      const searchError: SearchError = {
        code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      };
      
      setSearchState(prev => ({
        ...prev,
        status: 'error',
        error: searchError,
        lastUpdated: Date.now()
      }));
      throw error;
    }
  }, [setSearchState, setRecentSearches, setStory, setCurrentView]);

  return { search };
} 