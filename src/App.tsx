import React from 'react';
import { SearchContainer } from './features/search/SearchContainer';
import { SearchResultsContainer } from './features/search/SearchResultsContainer';
import { MVSWrapper } from './features/mvs/MVSWrapper';
/**
 * Main application component
 * Organizes the UI layout and wraps components with the ModelProvider
 * 
 * @component
 * @returns {JSX.Element} The main application component
 */
const App: React.FC = () => {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Mol* MolViewSpec Search Demo</h1>
        <p className="app-subtitle">
          Search, create and visualize molecular structures through programmatic MolViewSpec generation
        </p>
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
            <div className="panel-header">Results</div>
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
        </div>
      </div>
    </div>
  );
};

export default App;