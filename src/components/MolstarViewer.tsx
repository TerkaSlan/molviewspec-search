import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useModel, useBehavior, MolViewSpecModel } from '../model';

/**
 * Extends the Window interface to include the molstar global object
 * @global
 */
declare global {
  interface Window {
    /**
     * The global molstar object loaded from CDN
     */
    molstar: any;
  }
}

/**
 * Props for the MolstarViewer component
 * @interface MolstarViewerProps
 * @property {string} [width] - Width of the viewer container (default: '800px')
 * @property {string} [height] - Height of the viewer container (default: '600px')
 */
interface MolstarViewerProps {
  width?: string;
  height?: string;
}

/**
 * Interface for the MolstarViewer ref methods
 * @interface MolstarViewerRef
 * @property {(pdbId: string) => Promise<void>} loadPdbById - Method to load a PDB structure by ID
 */
export interface MolstarViewerRef {
  loadPdbById: (pdbId: string) => Promise<void>;
}

export function MolstarUI({ model }: { model: MolViewSpecModel }) {
  return <div style={{ position: 'relative', width: '100%', height: '100%' }}> 
  <Plugin plugin={model.molstar.plugin} /> // import from molstar/lib/mol-plugin-ui/plugin
  </div>
}
/**
 * MolstarViewer component for molecular structure visualization
 * Handles initialization of Mol* viewer and programmatic MVS generation
 * 
 * @component
 * @param {MolstarViewerProps} props - Component props
 * @param {React.Ref<MolstarViewerRef>} ref - Forwarded ref for parent component access
 * @returns {JSX.Element} The MolstarViewer component
 */
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

  useEffect(() => {
      const sub = model.state.result.subscribe((result) => {
        // ...
      });
      return () => sub.unsubscribe();
      
  }, [model]);

  /**
   * Initialize the Mol* viewer when the component mounts
   */
  useEffect(() => {
    let mounted = true;
    if (!containerRef.current || !window.molstar) return;

    /**
     * Initialize the Mol* viewer instance
     */
    const initViewer = async () => {
      try {
        const newViewer = await window.molstar.Viewer.create(
          containerRef.current,
          { 
            layoutIsExpanded: false, 
            layoutShowControls: false,
            layoutShowLeftPanel: false,
            layoutShowRightPanel: false
          }
        );
        
        if (mounted) {
          setViewer(newViewer);
        }
      } catch (err) {
        if (mounted) {
          setError(`Failed to initialize viewer: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    };

    initViewer();

    // Return cleanup function
    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Clean up the viewer when component unmounts
   */
  useEffect(() => {
    return () => {
      if (viewer) {
        viewer.plugin.dispose();
      }
    };
  }, [viewer]);

  /**
   * Helper function to handle and format errors
   * @param {string} operation - The operation that failed
   * @param {unknown} err - The error that occurred
   */
  const handleError = useCallback((operation: string, err: unknown) => {
    const errorMessage = `Failed to ${operation}: ${err instanceof Error ? err.message : String(err)}`;
    setError(errorMessage);
    model.state.error.next(errorMessage);
  }, [model]);

  /**
   * Load a PDB structure by ID and visualize it using MVS
   * @param {string} pdbId - The PDB ID to load
   * @returns {Promise<void>}
   */
  const loadPdbById = useCallback(async (pdbId: string) => {
    if (!viewer) return;
    
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
      
      // Use the builder to create a snapshot with metadata directly
      const mvsDescription = `### PDB Structure ${pdbId.toUpperCase()}
- Cartoon representation of protein
- Ball and stick representation of ligands`;
      
      const snapshot = builder.getSnapshot({
        title: `${pdbId.toUpperCase()} Structure Visualization`,
        description: mvsDescription,
        timestamp: new Date().toISOString()
      });
      
      // Set the MVS description in the model so DescriptionPanel can access it
      model.state.mvsDescription.next(mvsDescription);
      
      // Store the full snapshot in the model for download functionality
      model.state.currentMVS.next(snapshot);
      
      // Load the MVS with metadata
      await loadMVS(plugin, snapshot, { replaceExisting: true });
    } catch (err) {
      handleError(`load structure ${pdbId}`, err);
    } finally {
      setLoading(false);
    }
  }, [viewer, handleError, model]);

  /**
   * Load structure when search result changes
   */
  useEffect(() => {
    if (!viewer || !searchResult?.id) return;
    
    loadPdbById(searchResult.id);
  }, [viewer, searchResult, loadPdbById]);

  /**
   * Expose methods to parent component through ref
   */
  useImperativeHandle(ref, () => ({
    loadPdbById
  }), [loadPdbById]);

  return (
    <div className="viewer-container panel">
      <div className="panel-header">Structure Viewer</div>
      
      {error && <div className="error-display">{error}</div>}
      
      {loading && <div className="loading">Loading structure data...</div>}
      
      <div ref={containerRef} style={{ width, height }} />
    </div>
  );
});

export default MolstarViewer;
