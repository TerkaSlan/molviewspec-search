import React from 'react';
import MolstarViewer from './components/MolstarViewer';
import SearchInput from './components/SearchInput';
import DescriptionPanel from './components/DescriptionPanel';
import { ModelProvider } from './model';

const App: React.FC = () => {
  return (
    <ModelProvider>
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">Mol* MolViewSpec Demo</h1>
          <p className="app-subtitle">
            A demonstration of loading and building MolViewSpec views in Mol* viewer
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
              This demo shows two key functionalities:
            </p>
            <ol className="footer-list">
              <li>Loading a pre-defined MVS file (1cbs.mvsj) from a URL</li>
            </ol>
            <p>
              Enter a PDB ID in the search panel to view and explore structures.
              Check the console to see the MVS data that was loaded or built.
            </p>
          </div>
        </div>
      </div>
    </ModelProvider>
  );
};

export default App;
