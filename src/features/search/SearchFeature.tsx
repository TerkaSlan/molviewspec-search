import React, { useMemo } from 'react';
import { SearchContainer } from './SearchContainer';
import { SearchResultsContainer } from './SearchResultsContainer';
import { SearchModel } from './models/SearchModel';
import { MVSModel } from '../mvs/models/MVSModel';

interface SearchFeatureProps {
    model?: SearchModel;
    mvsModel?: MVSModel;
}

export function SearchFeature({ model: externalModel, mvsModel: externalMVSModel }: SearchFeatureProps) {
    // Create models if not provided
    const model = useMemo(() => externalModel || new SearchModel(), [externalModel]);
    const mvsModel = useMemo(() => externalMVSModel || new MVSModel(), [externalMVSModel]);

    return (
        <div className="search-feature">
            <SearchContainer model={model} />
            <SearchResultsContainer model={model} mvsModel={mvsModel} />
        </div>
    );
}

// Export individual components for more flexible layout
export function SearchInput({ model: externalModel }: SearchFeatureProps) {
    const model = useMemo(() => externalModel || new SearchModel(), [externalModel]);
    return <SearchContainer model={model} />;
}

export function SearchResults({ model: externalModel, mvsModel: externalMVSModel }: SearchFeatureProps) {
    const model = useMemo(() => externalModel || new SearchModel(), [externalModel]);
    const mvsModel = useMemo(() => externalMVSModel || new MVSModel(), [externalMVSModel]);
    return <SearchResultsContainer model={model} mvsModel={mvsModel} />;
} 