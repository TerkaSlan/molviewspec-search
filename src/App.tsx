import React, { useEffect } from 'react';
import MolstarViewer from './components/MolstarViewer';
import SearchInput from './components/SearchInput';
import DescriptionPanel from './components/DescriptionPanel';
import { ModelProvider, useModel } from './model';

/**
 * Main application component
 * Organizes the UI layout and wraps components with the ModelProvider
 * 
 * @component
 * @returns {JSX.Element} The main application component
 */
const App: React.FC = () => {
  return (
    <ModelProvider>
      <AppContent />
    </ModelProvider>
  );
};

const AppContent: React.FC = () => {
  const model = useModel();

  useEffect(() => {
    model.state.search.next({
      ...model.state.search.value,
      query: '1cbs'
    });
    model.searchStructure();
  }, [model]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Mol* MolViewSpec Search Demo</h1>
        <p className="app-subtitle">
          Search, create and visualize molecular structures through programmatic MolViewSpec generation
        </p>
      </header>
      
      <div className="main-content">
        <div className="left-panel panel">
          <div className="panel-header">Search</div>
          <SearchInput />
        </div>
        
        <div className="center-panel">
          <MolstarViewer 
            width="100%" 
            height="600px" 
          />
        </div>
        
        <div className="right-panel panel">
          <div className="panel-header">Structure Info</div>
          <DescriptionPanel />
        </div>
      </div>
    </div>
  );
};

export default App;
