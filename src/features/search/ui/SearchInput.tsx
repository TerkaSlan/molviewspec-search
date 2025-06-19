import React, { useCallback } from 'react';
import { SearchType } from '../types';
import { defaultQuery } from '../examples/preloaded';
import { useSearchViewState } from '../../../lib/hooks/use-global-state';
import { globalStateService } from '../../../lib/state/GlobalStateService';

interface SearchInputProps {
    value: string;
    isLoading: boolean;
    error: string | null;
    onSearch: (value: string, searchType: SearchType) => void;
    onClear: () => void;
}

export function SearchInput({
    value,
    isLoading,
    error,
    onSearch,
    onClear
}: SearchInputProps) {
    const { query, searchType } = useSearchViewState();

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query || defaultQuery, searchType);
    }, [query, searchType, onSearch]);

    const handleClear = useCallback(() => {
        globalStateService.clearSearch();
        onClear();
    }, [onClear]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only clear validation error when input changes
        if (error) {
            globalStateService.setValidationError(null);
        }
        globalStateService.setSearchQuery(value || defaultQuery, searchType);
    }, [searchType, error]);

    const handleSearchTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        globalStateService.setSearchQuery(query || defaultQuery, e.target.value as SearchType);
    }, [query]);

    return (
        <form onSubmit={handleSubmit} className="search-form">
            <div className="search-input-container">
                <input
                    type="text"
                    value={query || defaultQuery}
                    onChange={handleInputChange}
                    placeholder="Enter PDB ID or UniProt ID"
                    disabled={isLoading}
                    className={`search-input ${error ? 'error' : ''}`}
                />
                <select
                    value={searchType}
                    onChange={handleSearchTypeChange}
                    disabled={isLoading}
                    className="search-type-select"
                >
                    <option value="alphafind">AlphaFind</option>
                    <option value="foldseek">Foldseek</option>
                </select>
            </div>

            <div className="search-actions">
                <button
                    type="submit"
                    disabled={isLoading || !query || error !== null}
                    className="search-button"
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
                <button
                    type="button"
                    onClick={handleClear}
                    disabled={isLoading || !query}
                    className="clear-button"
                >
                    Clear
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
        </form>
    );
} 