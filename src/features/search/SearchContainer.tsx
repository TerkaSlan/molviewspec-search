import React, { useCallback } from 'react';
import { SearchInput } from './ui/SearchInput';
import { useSearchViewState } from '../../lib/hooks/use-global-state';
import { globalStateService } from '../../lib/state/GlobalStateService';
import { SearchType } from './types';

export function SearchContainer() {
  const {
    query,
    isValidating,
    isSearching,
    error
  } = useSearchViewState();

  const handleSearch = useCallback(async (inputValue: string, searchType: SearchType) => {
    try {
      // Only update the search query state - the service will handle the actual search
      globalStateService.setSearchQuery(inputValue, searchType);
    } catch (error) {
      globalStateService.setValidationError(error instanceof Error ? error.message : 'An error occurred');
    }
  }, []);

  const handleClear = useCallback(() => {
    globalStateService.clearSearch();
  }, []);

  return (
    <SearchInput
      value={query || ''}
      isLoading={isValidating || isSearching}
      error={error ?? null}
      onSearch={handleSearch}
      onClear={handleClear}
    />
  );
} 