import React, { useMemo } from 'react';
import { SearchContainer } from './features/search/SearchContainer';
import { SearchResultsContainer } from './features/search/SearchResultsContainer';
import { MVSWrapper } from './features/mvs/MVSWrapper';
import { MetadataContainer } from './features/search/MetadataContainer';
import { SearchModel } from './features/search/models/SearchModel';
/**
 * Main application component
 * Organizes the UI layout and wraps components with the SearchModel
 * 
 * @component
 * @returns {JSX.Element} The main application component
 */
const App: React.FC = () => {
  // Create a single instance of SearchModel to be shared
  const searchModel = useMemo(() => new SearchModel(), []);

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
              <SearchContainer model={searchModel} />
            </div>
          </div>
          
          <div className="panel results-panel">
            <div className="panel-header">Results</div>
            <div className="panel-content">
              <SearchResultsContainer model={searchModel} />
            </div>
          </div>
        </div>
        
        <div className="center-panel">
          <MVSWrapper model={searchModel} />
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
};

export default App;