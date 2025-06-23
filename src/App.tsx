import React, { useEffect, useMemo } from 'react';
import { SearchInput, SearchResults } from './features/search/SearchFeature';
import { MVSWrapper } from './features/mvs/MVSWrapper';
import { SearchModel } from './features/search/models/SearchModel';
import { MVSModel } from './features/mvs/models/MVSModel';
import { useReactiveModel } from './lib/hooks/use-reactive-model';
import { useObservable } from './lib/hooks/use-observable';
import { Story } from './features/types';
import { MetadataContainer } from './features/metadata/MetadataContainer';
import { preloadedResults, defaultQuery } from './features/search/examples/preloaded';

/**
 * Main application component
 * Organizes the UI layout and uses global state management
 * 
 * @component
 * @returns {JSX.Element} The main application component
 */
function useAppState(searchModel: SearchModel, mvsModel: MVSModel) {
    return {
        search: {
            results: useObservable(searchModel.selectors.results.items(), []),
            query: useObservable(searchModel.selectors.input.query(), null),
            selectedResult: useObservable(searchModel.selectors.results.selectedResult(), null),
            pdbMapping: useObservable(searchModel.selectors.input.pdbMapping(), null)
        },
        mvs: {
            story: useObservable(mvsModel.selectors.story.current(), null)
        }
    };
}

export function App() {
    // Create instances of our models
    const searchModel = useMemo(() => new SearchModel(), []);
    const mvsModel = useMemo(() => new MVSModel(), []);

    // Connect both models to React's lifecycle
    useReactiveModel(searchModel);
    useReactiveModel(mvsModel);

    // Subscribe to state using custom hook
    const state = useAppState(searchModel, mvsModel);

    // Initialize with preloaded data
    useEffect(() => {
        console.log('[App] Initializing with preloaded data');
        // Initialize search state
        searchModel.initializeWithResults(defaultQuery, preloadedResults.results);
    }, [searchModel]);

    // Connect search results to MVS
    useEffect(() => {
        console.log('[App] Updating MVS from search:', {
            query: state.search.query,
            resultCount: state.search.results.length,
            pdbMapping: state.search.pdbMapping
        });
        
        // If we have a PDB mapping, use the UniProt ID for MVS
        const queryId = state.search.pdbMapping?.uniprotId || state.search.query;
        
        mvsModel.updateFromSearchResults(
            queryId, 
            state.search.results,
            { pdbId: null } // Don't pass PDB ID since we want to use AlphaFold URL
        );
    }, [mvsModel, state.search.query, state.search.results, state.search.pdbMapping]);
    
    // Debug MVS state
    useEffect(() => {
        console.group('[App] MVS State Update');
        console.log('Story:', {
            hasStory: !!state.mvs.story,
            sceneCount: state.mvs.story?.scenes?.length || 0,
            metadata: state.mvs.story?.metadata
        });
        console.log('Selected Result:', state.search.selectedResult);
        console.groupEnd();
    }, [state.mvs.story, state.search.selectedResult]);

    useEffect(() => {
        if (state.search.selectedResult && state.mvs.story) {
            const scene = state.mvs.story.scenes.find(scene => {
                if ('result' in scene) {
                    const sceneWithResult = scene as { result: { object_id: string }, key: string };
                    return sceneWithResult.result.object_id === state.search.selectedResult?.object_id;
                }
                return false;
            });
            
            if (scene) {
                console.log('[App] Setting scene from selection:', scene.key);
                mvsModel.setCurrentSceneKey(scene.key);
            }
        }
    }, [mvsModel, state.search.selectedResult, state.mvs.story]);

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
                            Results{state.search.query ? ` for ${state.search.query}${
                                state.search.pdbMapping 
                                    ? ` → ${state.search.pdbMapping.uniprotId}`
                                    : ''
                            }` : ''}
                        </div>
                        <div className="panel-content">
                            <SearchResults model={searchModel} mvsModel={mvsModel} />
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
                    <MetadataContainer searchModel={searchModel} mvsModel={mvsModel} />
                </div>
            </div>
        </div>
    );
}

export default App;