import React, { useState, useEffect } from 'react';
import './App.css';
import MolstarViewer from './components/MolstarViewer';
import { createBasicMVS, createExplainedMVS } from './components/MVSBuilder';
import Search from './components/Search';
import Description from './components/Description';
import { MolstarProvider } from './components/MolstarContext';

function App() {
  const [useMVS, setUseMVS] = useState<boolean>(true);
  const [mvsMode, setMvsMode] = useState<'basic' | 'explained'>('basic');
  const [pdbId, setPdbId] = useState<string>('1tqn');
  const [contentHeight, setContentHeight] = useState<string | number>('100vh');

  useEffect(() => {
    // use contentHeight
    // Set an explicit height to prevent layout shifts
    setContentHeight('calc(100vh - 10px)');
    
    const handleResize = () => {
      setContentHeight('calc(100vh - 10px)');
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [contentHeight]);

  // Create an MVS data object
  const mvsData = useMVS ? (
    mvsMode === 'basic' 
      ? createBasicMVS(pdbId, {
          title: `Structure ${pdbId}`,
          description: "Standard representation with cartoon for protein and ball-and-stick for ligands"
        })
      : createExplainedMVS(pdbId, {
          title: `Interactive ${pdbId}`,
          description: "Multiple views of the structure with different representations"
        })
  ) : undefined;
  
  // For direct PDB loading
  const pdbUrl = !useMVS ? `https://files.rcsb.org/download/${pdbId}.cif` : undefined;
  
  const handlePdbIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdbId(e.target.value);
  };

  return (
    <MolstarProvider options={{ hideControls: false }}>
      <div className="App" style={{ 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%', 
        height: '100vh'
      }}>
        {/* Header with controls */}
        <header className="App-header">
          <h1>MolViewSpec Viewer</h1>
          <div className="controls">
            <div className="control-group">
              <label>PDB ID:</label>
              <input
                type="text"
                value={pdbId}
                onChange={handlePdbIdChange}
                placeholder="Enter PDB ID"
              />
            </div>
            
            <div className="control-group">
              <label>Mode:</label>
              <div className="button-group">
                <button 
                  onClick={() => setUseMVS(true)}
                  className={useMVS ? 'active' : ''}
                >
                  MolViewSpec
                </button>
                <button 
                  onClick={() => setUseMVS(false)}
                  className={!useMVS ? 'active' : ''}
                >
                  Direct PDB
                </button>
              </div>
            </div>
            
            {useMVS && (
              <div className="control-group">
                <label>MVS Type:</label>
                <div className="button-group">
                  <button 
                    onClick={() => setMvsMode('basic')}
                    className={mvsMode === 'basic' ? 'active' : ''}
                  >
                    Basic
                  </button>
                  <button 
                    onClick={() => setMvsMode('explained')}
                    className={mvsMode === 'explained' ? 'active' : ''}
                  >
                    Multi-View
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
        
        {/* Main content with 3-panel layout */}
        <div style={{ 
          display: 'flex', 
          flex: 1,
          width: '100%', 
          overflow: 'hidden'
        }}>
          {/* Search on the left (20%) */}
          <div style={{ 
            width: '20%', 
            borderRight: '1px solid #ddd',
            overflow: 'auto',
            padding: '10px'
          }}>
            <Search pdbId={pdbId} onPdbIdChange={handlePdbIdChange} />
          </div>
          
          {/* MolstarViewer in the middle (60%) */}
          <div style={{ 
            width: '60%', 
            position: 'relative',
            overflow: 'hidden'
          }}>
            <MolstarViewer 
              mvsData={mvsData}
              pdbUrl={pdbUrl}
              width="100%"
              height="100%"
            />
          </div>
          
          {/* Description on the right (20%) */}
          <div style={{ 
            width: '20%', 
            borderLeft: '1px solid #ddd',
            overflow: 'auto',
            padding: '10px'
          }}>
            <Description pdbId={pdbId} />
          </div>
        </div>
      </div>
    </MolstarProvider>
  );
}

export default App;
