import React from 'react';
import { SearchType } from '../types';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: (searchType: SearchType) => void;
    isDisabled: boolean;
    error?: string;
    searchType: SearchType;
    className?: string;
}

export function SearchInput({
    value,
    onChange,
    onSearch,
    isDisabled,
    error,
    searchType,
    className = ''
}: SearchInputProps) {
    return (
        <div className={`search-box ${className}`}>
            <div className="search-input-container">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            onSearch(searchType);
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
                    onClick={() => onSearch('alphafind')}
                    className="search-button"
                    disabled={isDisabled}
                >
                    {isDisabled ? 'Searching...' : 'AlphaFind Search'}
                </button>
                <button
                    onClick={() => onSearch('foldseek')}
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