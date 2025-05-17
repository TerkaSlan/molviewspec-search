import React, { useState, useEffect } from 'react';
import './App.css';
import MolstarViewer from './components/MolstarViewer';
import Search from './components/Search';
import Description from './components/Description';
import { MolstarProvider } from './components/MolstarContext';
import { createExampleMVS } from './components/MolstarContext';
import { MVSData_States } from 'molstar/lib/extensions/mvs/mvs-data';

function App() {
  const [viewerMode, setViewerMode] = useState<'direct' | 'mvs'>('mvs');
  const [pdbId, setPdbId] = useState<string>('1tqn');
  const [contentHeight, setContentHeight] = useState<string | number>('100vh');

  useEffect(() => {
    // Set an explicit height to prevent layout shifts
    setContentHeight('calc(100vh - 10px)');
    
    const handleResize = () => {
      setContentHeight('calc(100vh - 10px)');
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [contentHeight]);

  // Create URL or MVS data based on viewer mode
  const pdbUrl = `https://files.rcsb.org/download/${pdbId}.cif`;
  const mvsData = viewerMode === 'mvs' ? createExampleMVS(pdbId) : undefined;
  
  const handlePdbIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdbId(e.target.value);
  };

  const toggleViewerMode = () => {
    setViewerMode(prevMode => prevMode === 'direct' ? 'mvs' : 'direct');
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
              <label>Viewer Mode:</label>
              <button 
                onClick={toggleViewerMode}
                style={{ 
                  backgroundColor: viewerMode === 'mvs' ? '#3182ce' : undefined,
                  fontWeight: viewerMode === 'mvs' ? 'bold' : undefined
                }}
              >
                {viewerMode === 'direct' ? 'Direct PDB' : 'MVS Mode'}
              </button>
            </div>
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
              pdbUrl={viewerMode === 'direct' ? pdbUrl : undefined}
              mvsData={mvsData}
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
