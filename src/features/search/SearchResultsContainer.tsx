import React, { useCallback, useEffect } from 'react';
import { useReactiveModel } from '../../lib/hooks/use-reactive-model';
import { useObservable } from '../../lib/hooks/use-observable';
import { SearchResults } from './ui/SearchResults';
import { SearchModel } from './models/SearchModel';
import { SuperpositionData } from './types';
import { MVSModel } from '../mvs/models/MVSModel';

function useSearchState(model: SearchModel) {
    return {
        results: useObservable(model.selectors.results.items(), []),
        query: useObservable(model.selectors.input.query(), null),
        error: useObservable(model.selectors.search.status(), { isSearching: false, validationError: null })?.validationError,
        isSearching: useObservable(model.selectors.search.status(), { isSearching: false, validationError: null })?.isSearching,
        selectedResult: useObservable(model.selectors.results.selectedResult(), null)
    };
}

function useMVSState(model: MVSModel) {
    return {
        currentScene: useObservable(model.selectors.story.currentScene(), null),
        selectedResult: useObservable(model.selectors.viewer.selectedResult(), null)
    };
}

interface SearchResultsContainerProps {
    model: SearchModel;
    mvsModel: MVSModel;
}

export function SearchResultsContainer({ model, mvsModel }: SearchResultsContainerProps) {
    // Connect the model to React's lifecycle
    useReactiveModel(model);
    useReactiveModel(mvsModel);

    // Subscribe to state using custom hooks
    const search = useSearchState(model);
    const mvs = useMVSState(mvsModel);

    // Debug state changes
    useEffect(() => {
        console.group('[SearchResultsContainer] State Update');
        console.log('Results:', {
            count: search.results.length,
            items: search.results.map(r => r.object_id)
        });
        console.log('Query:', search.query);
        console.log('Scene:', {
            currentSceneKey: mvs.currentScene,
            mvsSelectedId: mvs.selectedResult?.object_id,
            searchSelectedId: search.selectedResult?.object_id
        });
        console.log('Status:', { 
            isSearching: search.isSearching, 
            error: search.error 
        });
        console.groupEnd();
    }, [search, mvs]);

    // Sync MVS scene changes to search model selected result
    useEffect(() => {
        if (mvs.currentScene && search.results.length > 0) {
            // Extract object_id from scene key (format: scene_${object_id})
            const objectId = mvs.currentScene.replace('scene_', '');
            const result = search.results.find(r => r.object_id === objectId);
            if (result) {
                console.log('[SearchResultsContainer] Syncing MVS scene to search selection:', {
                    fromScene: objectId,
                    currentSearchSelection: search.selectedResult?.object_id,
                    currentMVSSelection: mvs.selectedResult?.object_id
                });
                model.setSelectedResult(result);
            }
        }
    }, [mvs.currentScene, search.results, model, search.selectedResult, mvs.selectedResult]);

    const handleResultClick = useCallback((result: SuperpositionData) => {
        console.log('[SearchResultsContainer] Result clicked:', {
            clicked: result.object_id,
            currentScene: mvs.currentScene,
            currentSearchSelection: search.selectedResult?.object_id,
            currentMVSSelection: mvs.selectedResult?.object_id
        });
        model.setSelectedResult(result);
    }, [model, mvs.currentScene, search.selectedResult, mvs.selectedResult]);

    return (
        <SearchResults
            results={search.results}
            error={search.error ? { message: search.error } : null}
            progress={null} // TODO: Add progress tracking to model if needed
            isEmpty={!search.query}
            hasResults={search.results.length > 0}
            onResultClick={handleResultClick}
            model={mvsModel}
        />
    );
} 