import React, { useState, useCallback } from 'react';
import { SearchType } from '../types';
import { defaultQuery } from '../examples/preloaded';

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
    const [inputValue, setInputValue] = useState(value);
    const [searchType, setSearchType] = useState<SearchType>('alphafind');

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSearch(inputValue.trim(), searchType);
    }, [inputValue, searchType, onSearch]);

    const handleClear = useCallback(() => {
        setInputValue('');
        onClear();
    }, [onClear]);

    const isDefaultQuery = value === defaultQuery;

    return (
        <form onSubmit={handleSubmit} className="search-form">
            <div className="search-input-container">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter PDB ID or UniProt ID"
                    disabled={isLoading}
                    className={`search-input ${error ? 'error' : ''}`}
                />
                <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as SearchType)}
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
                    disabled={isLoading || !inputValue.trim()}
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