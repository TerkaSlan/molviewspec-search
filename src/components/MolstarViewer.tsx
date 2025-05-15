import React, { useEffect, useRef } from 'react';
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
  
  // Initialize plugin when the component mounts
  useEffect(() => {
    console.log('MolstarViewer: Initialize plugin effect', { pdbUrl, mvsData });
    if (!containerRef.current) return;
    
    // This div will host the Molstar plugin
    const pluginContainer = containerRef.current;
    let mounted = true;

    // Initialize the plugin with the container element
    initializePlugin(pluginContainer)
      .then(() => {
        if (mounted) {
          console.log('MolstarViewer: Plugin initialized successfully');
        }
      })
      .catch(err => {
        if (mounted) {
          console.error('Failed to initialize Molstar plugin:', err);
          if (onError) onError(err instanceof Error ? err : new Error('Failed to initialize plugin'));
        }
      });
    
    // Cleanup when component unmounts - just mark as unmounted, don't try to dispose
    return () => {
      console.log('MolstarViewer: Cleaning up component');
      mounted = false;
    };
  }, [initializePlugin, onError, pdbUrl, mvsData]);
  
  // Load data when props change
  useEffect(() => {
    console.log('MolstarViewer: Load data effect', { pdbUrl, mvsData, isInitialized: isInitialized() });
    if (!isInitialized()) {
      console.log('MolstarViewer: Plugin not initialized yet, skipping data load');
      return;
    }
    
    const loadData = async () => {
      console.log('MolstarViewer: Loading data', { pdbUrl, mvsData });
      try {
        if (mvsData) {
          console.log('MolstarViewer: Loading MVS data');
          await loadMvsData(mvsData);
          console.log('MolstarViewer: MVS data loaded successfully');
          if (onStructureLoaded) onStructureLoaded();
        } else if (pdbUrl) {
          console.log('MolstarViewer: Loading PDB structure from URL', pdbUrl);
          await loadPdbStructure(pdbUrl);
          console.log('MolstarViewer: PDB structure loaded successfully');
          if (onStructureLoaded) onStructureLoaded();
        } else {
          console.log('MolstarViewer: No data to load');
        }
      } catch (err) {
        console.error('MolstarViewer: Error loading data', err);
        if (onError) {
          onError(err instanceof Error ? err : new Error('Failed to load data'));
        }
      }
    };
    
    loadData();
  }, [pdbUrl, mvsData, loadPdbStructure, loadMvsData, isInitialized, onStructureLoaded, onError]);
  
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