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
        selectedResult: useObservable(model.selectors.results.selectedResult(), null),
        itemsPerPage: useObservable(model.selectors.pagination.itemsPerPage(), 5),
        currentPage: useObservable(model.selectors.pagination.currentPage(), 1),
        lastProcessedMVSResult: useObservable(model.selectors.search.lastProcessedMVSResult(), null)
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

    // Debug MVS model instance
    React.useEffect(() => {
        console.log('[SearchResultsContainer] MVS Model Instance:', {
            model: mvsModel,
            currentScene: mvs.currentScene,
            selectedResult: mvs.selectedResult?.object_id
        });
    }, [mvsModel, mvs.currentScene, mvs.selectedResult]);

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
            searchSelectedId: search.selectedResult?.object_id,
            currentPage: search.currentPage,
            lastProcessedMVSResult: search.lastProcessedMVSResult
        });
        console.log('Status:', { 
            isSearching: search.isSearching, 
            error: search.error 
        });
        console.groupEnd();
    }, [search, mvs]);

    // Sync MVS scene changes to search model selected result and pagination
    useEffect(() => {
        const mvsResultId = mvs.selectedResult?.object_id;
        
        // Skip if no MVS result or no search results
        if (!mvsResultId || search.results.length === 0) {
            return;
        }

        // Skip if we've already processed this MVS result
        if (search.lastProcessedMVSResult === mvsResultId) {
            return;
        }

        console.log('[SearchResultsContainer] MVS state change effect:', {
            currentScene: mvs.currentScene,
            mvsSelectedResult: mvsResultId,
            searchSelectedResult: search.selectedResult?.object_id,
            resultsCount: search.results.length,
            currentPage: search.currentPage,
            lastProcessedMVSResult: search.lastProcessedMVSResult
        });

        const result = search.results.find(r => r.object_id === mvsResultId);
        if (result) {
            // Update the lastProcessedMVSResult
            model.setLastProcessedMVSResult(mvsResultId);

            // Sync selection if needed
            if (result.object_id !== search.selectedResult?.object_id) {
                console.log('[SearchResultsContainer] Syncing MVS selection to search:', {
                    fromMVS: mvsResultId,
                    currentSearch: search.selectedResult?.object_id
                });
                model.setSelectedResult(result);
            }
            
            // Calculate the correct page
            const resultIndex = search.results.findIndex(r => r.object_id === result.object_id);
            if (resultIndex !== -1) {
                const targetPage = Math.floor(resultIndex / search.itemsPerPage) + 1;
                
                // Only update page if it's different from current
                if (targetPage !== search.currentPage) {
                    console.log('[SearchResultsContainer] Syncing pagination:', {
                        resultIndex,
                        itemsPerPage: search.itemsPerPage,
                        currentPage: search.currentPage,
                        targetPage
                    });
                    model.setPage(targetPage);
                }
            }
        }
    }, [
        mvs.selectedResult,
        mvs.currentScene,
        search.results,
        search.selectedResult,
        search.itemsPerPage,
        search.currentPage,
        search.lastProcessedMVSResult,
        model
    ]);

    const handleResultClick = useCallback((result: SuperpositionData) => {
        console.log('[SearchResultsContainer] Result clicked:', {
            clicked: result.object_id,
            currentScene: mvs.currentScene,
            currentSearchSelection: search.selectedResult?.object_id,
            currentMVSSelection: mvs.selectedResult?.object_id
        });
        
        // Update the lastProcessedMVSResult
        model.setLastProcessedMVSResult(result.object_id);
        
        // Set selected result in both models to ensure consistent state
        model.setSelectedResult(result);
        mvsModel.setSelectedResult(result);
        // Update MVS scene to match the selected result
        mvsModel.setCurrentSceneKey(`scene_${result.object_id}`);
    }, [model, mvsModel, mvs.currentScene, search.selectedResult, mvs.selectedResult]);

    return (
        <SearchResults
            results={search.results}
            error={search.error ? { message: search.error } : null}
            progress={null}
            isEmpty={!search.query}
            hasResults={search.results.length > 0}
            onResultClick={handleResultClick}
            model={mvsModel}
            searchModel={model}
        />
    );
} 