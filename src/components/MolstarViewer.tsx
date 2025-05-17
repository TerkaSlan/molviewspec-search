import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useModel, useBehavior } from '../model';

// We'll use the global molstar object that's loaded from CDN
declare global {
  interface Window {
    molstar: any;
  }
}

interface MolstarViewerProps {
  width?: string;
  height?: string;
}

// Define the ref type
export interface MolstarViewerRef {
  buildCustomMVS: () => Promise<void>;
  loadPdbById: (pdbId: string) => Promise<void>;
}

const MolstarViewer = forwardRef<MolstarViewerRef, MolstarViewerProps>(({
  width = '800px',
  height = '600px',
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const model = useModel();
  
  // Use the model's current search result
  const searchResult = useBehavior(model.state.currentResult);

  // Initialize the Mol* viewer
  useEffect(() => {
    if (!containerRef.current || !window.molstar) return;

    // Initialize the viewer
    const initViewer = async () => {
      const viewer = await window.molstar.Viewer.create(
        containerRef.current,
        { 
          layoutIsExpanded: false, 
          layoutShowControls: false,
          layoutShowLeftPanel: false,
          layoutShowRightPanel: false
        }
      );
      
      setViewer(viewer);
    };

    initViewer();

    return () => {
      if (viewer) {
        viewer.plugin.dispose();
      }
    };
  }, []);

  // Memoize the loadPdbById function so it has a stable identity for dependency arrays
  const loadPdbById = useCallback(async (pdbId: string) => {
    if (!viewer) return;
    
    console.log(`MolstarViewer: loadPdbById called with ${pdbId}`);
    setLoading(true);
    setError(null);
    
    try {
      const plugin = viewer.plugin;
      await plugin.clear();
      
      // Get the MVSData and loadMVS functions from the plugin extensions
      const MVSData = window.molstar.PluginExtensions.mvs.MVSData;
      const loadMVS = window.molstar.PluginExtensions.mvs.loadMVS;
      
      // Build the MVS
      const builder = MVSData.createBuilder();
      const structure = builder
        .download({ url: `https://www.ebi.ac.uk/pdbe/entry-files/download/${pdbId}_updated.cif` })
        .parse({ format: 'mmcif' })
        .modelStructure();
      
      structure
        .component({ selector: 'polymer' })
        .representation({ type: 'cartoon' });
      
      structure
        .component({ selector: 'ligand' })
        .representation({ type: 'ball_and_stick' });
      
      // Create metadata for the MVS snapshot
      const snapshot = builder.getState();
      snapshot.metadata = {
        title: `${pdbId.toUpperCase()} Structure Visualization`,
        description: `### PDB Structure ${pdbId.toUpperCase()}
- Cartoon representation of protein
- Ball and stick representation of ligands`,
        timestamp: new Date().toISOString(),
      };
      console.log(snapshot);
      // Load the MVS with metadata
      await loadMVS(plugin, snapshot, { replaceExisting: true });
      
      console.log(`Successfully loaded structure ${pdbId}`);
    } catch (err) {
      console.error(`Error loading structure ${pdbId}:`, err);
      setError(`Failed to load structure ${pdbId}: ${err instanceof Error ? err.message : String(err)}`);
      
      // Update model with error
      model.state.error.next(`Failed to load structure ${pdbId}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, [viewer, model]);

  // Subscribe to model search result changes to load structures
  useEffect(() => {
    if (!viewer) return;

    // If we have a search result, load the structure
    if (searchResult && searchResult.id) {
      console.log(`MolstarViewer: Loading structure ${searchResult.id} from model update`);
      loadPdbById(searchResult.id);
    }
  }, [viewer, searchResult, loadPdbById]);

  // Build a custom MVS and load it
  const buildCustomMVS = useCallback(async () => {
    if (!viewer) return;

    setLoading(true);
    setError(null);

    try {
      // For building a custom MVS, we need to use the plugin directly
      const plugin = viewer.plugin;
      
      // Get the MVSData and loadMVS functions from the plugin extensions
      const MVSData = window.molstar.PluginExtensions.mvs.MVSData;
      const loadMVS = window.molstar.PluginExtensions.mvs.loadMVS;
      
      // Build the MVS
      const builder = MVSData.createBuilder();
      const structure = builder
        .download({ url: 'https://www.ebi.ac.uk/pdbe/entry-files/download/1og2_updated.cif' })
        .parse({ format: 'mmcif' })
        .modelStructure();
      
      structure
        .component({ selector: 'polymer' })
        .representation({ type: 'cartoon' });
      
      structure
        .component({ selector: 'ligand' })
        .representation({ type: 'ball_and_stick' })
        .color({ color: '#aa55ff' });
      
      // Create metadata for the MVS snapshot
      const snapshot = builder.getState();
      snapshot.metadata = {
        title: "1og2 Structure Visualization",
        description: `### Estrogen Receptor Ligand Binding Domain
- PDB ID: 1og2
- Cartoon representation of protein
- Ball and stick representation of ligands (colored purple)
- Resolution: 2.05Å`,
        authors: ["Warnmark, A.", "Treuter, E.", "Gustafsson, J.A.", "Hubbard, R.E.", "Brzozowski, A.M."],
        timestamp: new Date().toISOString(),
        version: "1.0"
      };
      
      // Load the MVS with metadata
      await loadMVS(plugin, snapshot, { replaceExisting: true });
      
      console.log('Successfully built and loaded custom MVS for 1og2');
    } catch (err) {
      console.error('Error building MVS:', err);
      setError(`Failed to build MVS: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, [viewer]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    buildCustomMVS,
    loadPdbById
  }), [buildCustomMVS, loadPdbById]);

  return (
    <div className="viewer-container panel">
      <div className="panel-header">Structure Viewer</div>
      <div className="button-container">
        <button onClick={buildCustomMVS} disabled={loading || !viewer}>
          {loading ? 'Loading...' : 'Build Custom MVS (1og2)'}
        </button>
        <button onClick={() => loadPdbById('1cbs')} disabled={loading || !viewer}>
          Load 1cbs
        </button>
      </div>
      
      {error && <div className="error-display">{error}</div>}
      
      {loading && <div className="loading">Loading structure data...</div>}
      
      <div ref={containerRef} style={{ width, height }} />
    </div>
  );
});

export default MolstarViewer;
