import React, { useCallback } from 'react';
import { SearchType } from '../types';
import { defaultQuery } from '../examples/preloaded';
import { SearchModel } from '../models/SearchModel';

interface SearchInputProps {
    value: string;
    searchType: SearchType;
    isLoading: boolean;
    error: string | null;
    onSearch: (value: string, searchType: SearchType) => void;
    onClear: () => void;
    model: SearchModel;
}

export function SearchInput({
    value,
    searchType,
    isLoading,
    error,
    onSearch,
    onClear,
    model
}: SearchInputProps) {
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSearch(value || defaultQuery, searchType);
    }, [value, searchType, onSearch]);

    const handleClear = useCallback(() => {
        model.clearSearch();
        onClear();
    }, [model, onClear]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only clear validation error when input changes
        if (error) {
            model.setValidationError(null);
        }
        model.setSearchInput({ 
            query: value || defaultQuery,
            searchType 
        });
    }, [model, searchType, error]);

    const handleSearchTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        model.setSearchInput({
            query: value || defaultQuery,
            searchType: e.target.value as SearchType
        });
    }, [model, value]);

    return (
        <form onSubmit={handleSubmit} className="search-form">
            <div className="search-input-container">
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    placeholder="Enter PDB ID or UniProt ID"
                    disabled={isLoading}
                    className={`search-input ${error ? 'error' : ''} ${value === defaultQuery ? 'default-query' : ''}`}
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
                    disabled={isLoading || !value || error !== null}
                    className="search-button"
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
                <button
                    type="button"
                    onClick={handleClear}
                    disabled={isLoading || !value}
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