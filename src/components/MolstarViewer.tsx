import React, { useEffect, useRef, useState } from 'react';
import { MolstarViewerProps } from './types';
import { useMolstar } from './MolstarContext';
import 'molstar/lib/mol-plugin-ui/skin/light.scss';

/**
 * A React component that displays a molecular structure using the Molstar library.
 * This is a presentational component that renders the viewer container.
 * It expects to be within a MolstarProvider context.
 */
const MolstarViewer: React.FC<MolstarViewerProps> = ({
  width = '100%',
  height = '100%',
  pdbUrl,
  mvsData,
  options = {},
  onStructureLoaded,
  onError
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { loading, error, loadPdbStructure, loadMvsData, isInitialized, initializePlugin } = useMolstar();
  const [initComplete, setInitComplete] = useState(false);
  
  // Handle initialization and data loading
  useEffect(() => {
    console.log('MolstarViewer: Effect triggered', { pdbUrl, mvsData });
    if (!containerRef.current) return;
    
    let mounted = true;
    const pluginContainer = containerRef.current;
    
    const initAndLoadData = async () => {
      try {
        // Step 1: Initialize plugin if needed
        if (!isInitialized()) {
          console.log('MolstarViewer: Initializing plugin');
          await initializePlugin(pluginContainer);
          if (!mounted) return;
          console.log('MolstarViewer: Plugin initialized successfully');
          setInitComplete(true);
        }
        
        // Step 2: Load data
        if (mvsData) {
          console.log('MolstarViewer: Loading MVS data');
          await loadMvsData(mvsData);
          if (!mounted) return;
          console.log('MolstarViewer: MVS data loaded successfully');
          if (onStructureLoaded) onStructureLoaded();
        } else if (pdbUrl) {
          console.log('MolstarViewer: Loading PDB structure from URL', pdbUrl);
          await loadPdbStructure(pdbUrl);
          if (!mounted) return;
          console.log('MolstarViewer: PDB structure loaded successfully');
          if (onStructureLoaded) onStructureLoaded();
        } else {
          console.log('MolstarViewer: No data to load');
        }
      } catch (err) {
        if (!mounted) return;
        console.error('MolstarViewer: Error during initialization or data loading', err);
        if (onError) {
          onError(err instanceof Error ? err : new Error('Failed to initialize or load data'));
        }
      }
    };
    
    initAndLoadData();
    
    // Cleanup when component unmounts
    return () => {
      console.log('MolstarViewer: Cleaning up component');
      mounted = false;
    };
  }, [
    pdbUrl, 
    mvsData, 
    initializePlugin, 
    isInitialized, 
    loadPdbStructure, 
    loadMvsData, 
    onStructureLoaded, 
    onError
  ]);
  
  // Forward error to parent if provided
  useEffect(() => {
    if (error) {
      console.error('MolstarViewer: Error from context', error);
      if (onError) {
        onError(error);
      }
    }
  }, [error, onError]);
  
  return (
    <div
      ref={containerRef}
      data-testid="molstar-viewer"
      className="molstar-viewer-container"
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {loading && (
        <div className="molstar-loading-indicator">
          <span>Loading...</span>
        </div>
      )}
    </div>
  );
};

export default MolstarViewer; 