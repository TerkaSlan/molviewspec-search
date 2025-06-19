import React, { useMemo } from 'react';
import { SearchContainerNext } from './SearchContainerNext';
import { SearchResultsContainerNext } from './SearchResultsContainerNext';
import { SearchModel } from './models/SearchModel';

interface SearchFeatureProps {
    model?: SearchModel;
}

export function SearchFeatureNext({ model: externalModel }: SearchFeatureProps) {
    // Create a model if one wasn't provided
    const model = useMemo(() => externalModel || new SearchModel(), [externalModel]);

    return (
        <div className="search-feature">
            <SearchContainerNext model={model} />
            <SearchResultsContainerNext model={model} />
        </div>
    );
}

// Export individual components for more flexible layout
export function SearchInputNext({ model: externalModel }: SearchFeatureProps) {
    const model = useMemo(() => externalModel || new SearchModel(), [externalModel]);
    return <SearchContainerNext model={model} />;
}

export function SearchResultsNext({ model: externalModel }: SearchFeatureProps) {
    const model = useMemo(() => externalModel || new SearchModel(), [externalModel]);
    return <SearchResultsContainerNext model={model} />;
} 