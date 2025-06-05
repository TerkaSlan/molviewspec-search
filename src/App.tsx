import React, { useEffect } from 'react';
import MolstarViewer from './components/MolstarViewer';
import SearchInput from './components/SearchInput';
import DescriptionPanel from './components/DescriptionPanel';
import { ModelProvider, useBehavior, useSearchModel } from './model';

/**
 * Main application component
 * Organizes the UI layout and wraps components with the ModelProvider
 * 
 * @component
 * @returns {JSX.Element} The main application component
 */
const App: React.FC = () => {
  const model = useSearchModel();

  useEffect(() => {
    model.state.searchQuery.next('1cbs');
    model.searchStructure()
  }, [model]);

  return (
    // <MolViewSpecContext.Provider value={model}> 
    <ModelProvider>
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
        
        <div className="app-footer panel">
          <h2 className="footer-title">About this demo</h2>
          <div className="footer-content">
            <p>
              This demo showcases the programmatic creation of MolViewSpec (MVS) for molecular visualization:
            </p>
            <ol className="footer-list">
              <li>Enter a PDB ID in the search box</li>
              <li>The app programmatically constructs an MVS with appropriate representations</li>
              <li>The MVS builder creates a snapshot with integrated metadata and descriptions</li>
              <li>The complete MVS is passed to Mol* viewer for interactive visualization</li>
              <li>The MVS-generated description is displayed in the structure info panel</li>
              <li>Download the MVSJ file for use in other Mol* applications</li>
            </ol>
            <p>
              This demonstrates how MVS can be dynamically generated and used as a complete visualization specification.
            </p>
          </div>
        </div>
      </div>
    </ModelProvider>
  );
};

export default App;
