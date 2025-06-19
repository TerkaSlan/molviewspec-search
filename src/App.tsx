import React, { useEffect, useMemo } from 'react';
import { SearchInput, SearchResults } from './features/search/SearchFeature';
import { MVSWrapper } from './features/mvs/MVSWrapper';
import { SearchModel } from './features/search/models/SearchModel';
import { MVSModel } from './features/mvs/models/MVSModel';
import { useReactiveModel } from './lib/hooks/use-reactive-model';
import { useObservable } from './lib/hooks/use-observable';
import { Story } from './features/types';
import { MetadataContainer } from './features/search/MetadataContainer';
import { preloadedResults, defaultQuery } from './features/search/examples/preloaded';

/**
 * Main application component
 * Organizes the UI layout and uses global state management
 * 
 * @component
 * @returns {JSX.Element} The main application component
 */
export function App() {
    // Create instances of our models
    const searchModel = useMemo(() => new SearchModel(), []);
    const mvsModel = useMemo(() => new MVSModel(), []);

    // Connect both models to React's lifecycle
    useReactiveModel(searchModel);
    useReactiveModel(mvsModel);

    // Initialize with preloaded data
    useEffect(() => {
        console.log('[App] Initializing with preloaded data');
        // Initialize search state
        searchModel.initializeWithResults(defaultQuery, preloadedResults.results);
    }, [searchModel]);

    // Subscribe to search state to update MVS
    const searchResults = useObservable(searchModel.getResults$(), []);
    const searchQuery = useObservable(searchModel.getQuery$(), null);

    // Connect search results to MVS
    useEffect(() => {
        console.log('[App] Updating MVS from search:', {
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
        console.group('[App] MVS State Update');
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
                console.log('[App] Setting scene from selection:', scene.key);
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
                            <SearchInput model={searchModel} />
                        </div>
                    </div>
                    
                    <div className="panel results-panel">
                        <div className="panel-header">
                            Results{searchQuery ? ` for ${searchQuery}` : ''}
                        </div>
                        <div className="panel-content">
                            <SearchResults model={searchModel} />
                        </div>
                    </div>
                </div>
                
                <div className="center-panel">
                    <MVSWrapper model={mvsModel} />
                </div>
            </div>

            <div className="bottom-panel panel">
                <div className="panel-header">Structure Info</div>
                <div className="panel-content">
                    <MetadataContainer model={searchModel} />
                </div>
            </div>
        </div>
    );
}

export default App;