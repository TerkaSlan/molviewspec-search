import React, { useEffect, useMemo } from 'react';
import { SearchInputNext, SearchResultsNext } from './search/SearchFeatureNext';
import { MVSWrapperNext } from './mvs/MVSWrapperNext';
import { SearchModel } from './search/models/SearchModel';
import { MVSModel } from './mvs/models/MVSModel';
import { useReactiveModel } from '../lib/hooks/use-reactive-model';
import { useObservable } from '../lib/hooks/use-observable';
import { Story } from './types';
import { MetadataContainer } from './search/MetadataContainer';

export function AppNext() {
    // Create instances of our models
    const searchModel = useMemo(() => new SearchModel(), []);
    const mvsModel = useMemo(() => new MVSModel(), []);

    // Connect both models to React's lifecycle
    useReactiveModel(searchModel);
    useReactiveModel(mvsModel);

    // Subscribe to search state to update MVS
    const searchResults = useObservable(searchModel.getResults$(), []);
    const searchQuery = useObservable(searchModel.getQuery$(), null);

    // Debug search state
    useEffect(() => {
        console.group('[AppNext] Search State Update');
        console.log('Query:', searchQuery);
        console.log('Results:', {
            count: searchResults.length,
            results: searchResults
        });
        console.groupEnd();
    }, [searchQuery, searchResults]);

    // Connect search results to MVS
    useEffect(() => {
        console.log('[AppNext] Updating MVS from search:', {
            query: searchQuery,
            resultCount: searchResults.length
        });
        mvsModel.updateFromSearchResults(searchQuery, searchResults);
    }, [mvsModel, searchQuery, searchResults]);

    // Subscribe to selected result from search to update MVS
    const selectedResult = useObservable(searchModel.getSelectedResult$(), null);
    const story = useObservable(mvsModel.getStory$(), null);
    
    // Debug MVS state
    useEffect(() => {
        console.group('[AppNext] MVS State Update');
        console.log('Story:', {
            hasStory: !!story,
            sceneCount: story?.scenes?.length || 0,
            metadata: story?.metadata
        });
        console.log('Selected Result:', selectedResult);
        console.groupEnd();
    }, [story, selectedResult]);

    useEffect(() => {
        if (selectedResult && story) {
            const scene = story.scenes.find(scene => {
                if ('result' in scene) {
                    const sceneWithResult = scene as { result: { object_id: string }, key: string };
                    return sceneWithResult.result.object_id === selectedResult.object_id;
                }
                return false;
            });
            
            if (scene) {
                console.log('[AppNext] Setting scene from selection:', scene.key);
                mvsModel.setCurrentSceneKey(scene.key);
            }
        }
    }, [mvsModel, selectedResult, story]);

    return (
        <div className="app-container">
            <header className="app-header">
                <h1 className="app-title">Visualize Protein Similarity through Molecular Stories</h1>
            </header>
            
            <div className="main-content">
                <div className="left-side">
                    <div className="panel search-panel">
                        <div className="panel-header">Search</div>
                        <div className="panel-content">
                            <SearchInputNext model={searchModel} />
                        </div>
                    </div>
                    
                    <div className="panel results-panel">
                        <div className="panel-header">
                            Results{searchQuery ? ` for ${searchQuery}` : ''}
                        </div>
                        <div className="panel-content">
                            <SearchResultsNext model={searchModel} />
                        </div>
                    </div>
                </div>
                
                <div className="center-panel">
                    <MVSWrapperNext model={mvsModel} />
                </div>
            </div>

            <div className="bottom-panel panel">
                <div className="panel-header">Structure Info</div>
                <div className="panel-content">
                    <MetadataContainer />
                </div>
            </div>
        </div>
    );
} 