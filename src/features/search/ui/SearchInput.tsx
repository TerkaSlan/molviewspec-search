import React, { useCallback, useState, useEffect } from 'react';
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
    value: modelValue,
    searchType: modelSearchType,
    isLoading,
    error,
    onSearch,
    onClear,
    model
}: SearchInputProps) {
    // Local state for input value and search type
    const [inputValue, setInputValue] = useState(modelValue || '');
    const [localSearchType, setLocalSearchType] = useState(modelSearchType);

    // Update local state when model value changes
    useEffect(() => {
        setInputValue(modelValue || '');
    }, [modelValue]);

    useEffect(() => {
        setLocalSearchType(modelSearchType);
    }, [modelSearchType]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSearch(inputValue || defaultQuery, localSearchType);
    }, [inputValue, localSearchType, onSearch]);

    const handleClear = useCallback(() => {
        setInputValue('');
        model.clearSearch();
        onClear();
    }, [model, onClear]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        // Only clear validation error when input changes
        if (error) {
            model.setValidationError(null);
        }
        setInputValue(newValue || defaultQuery);
    }, [error, model]);

    const handleSearchTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSearchType = e.target.value as SearchType;
        setLocalSearchType(newSearchType);
    }, []);

    return (
        <form onSubmit={handleSubmit} className="search-form">
            <div className="search-input-container">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Enter PDB ID or UniProt ID"
                    disabled={isLoading}
                    className={`search-input ${error ? 'error' : ''} ${inputValue === defaultQuery ? 'default-query' : ''}`}
                />
                <select
                    value={localSearchType}
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
                    disabled={isLoading || !inputValue || error !== null}
                    className="search-button"
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
                <button
                    type="button"
                    onClick={handleClear}
                    disabled={isLoading || !inputValue}
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