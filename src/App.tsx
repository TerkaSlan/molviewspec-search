import React from 'react';
import { SearchContainer } from './features/search/SearchContainer';
import { SearchResultsContainer } from './features/search/SearchResultsContainer';
import { MVSWrapper } from './features/mvs/MVSWrapper';
import { MetadataContainer } from './features/search/MetadataContainer';
import { useSearchState } from './lib/hooks/use-global-state';

/**
 * Main application component
 * Organizes the UI layout and uses global state management
 * 
 * @component
 * @returns {JSX.Element} The main application component
 */
const App: React.FC = () => {
  const searchState = useSearchState();

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
              <SearchContainer />
            </div>
          </div>
          
          <div className="panel results-panel">
            <div className="panel-header">Results{searchState?.query ? ` for ${searchState.query}` : ''}</div>
            <div className="panel-content">
              <SearchResultsContainer />
            </div>
          </div>
        </div>
        
        <div className="center-panel">
          <MVSWrapper />
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
};

export default App;