import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { searchStructures } from '../api';
import { SearchStateAtom } from '../state';
import { AlphaFindSearchOptions } from '../types';

export function useSearch() {
  const setSearchState = useSetAtom(SearchStateAtom);

  const search = useCallback(async (options: Omit<AlphaFindSearchOptions, 'onProgress' | 'onPartialResults'>) => {
    setSearchState(prev => ({
      ...prev,
      query: options.query,
      isSearching: true,
      error: null,
      progress: null
    }));

    try {
      const response = await searchStructures({
        ...options,
        onProgress: (progress) => {
          setSearchState(prev => ({
            ...prev,
            progress
          }));
        },
        onPartialResults: (data) => {
          const results = data.results || [];
          setSearchState(prev => ({
            ...prev,
            results
          }));
        }
      });

      const finalResults = response.results || [];
      setSearchState(prev => ({
        ...prev,
        isSearching: false,
        results: finalResults,
        error: null
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setSearchState(prev => ({
        ...prev,
        isSearching: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [setSearchState]);

  return { search };
} 