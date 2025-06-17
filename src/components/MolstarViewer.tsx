import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { useModel, useBehavior, MolViewSpecModel } from '../model';
import { Plugin } from 'molstar/lib/mol-plugin-ui/plugin';

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

// Track symbol registration globally to ensure it only happens once across all instances
let symbolsRegistered = false;

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

/* import from molstar/lib/mol-plugin-ui/plugin */
export function MolstarUI({ model }: { model: MolViewSpecModel }) {
  return <div style={{ position: 'relative', width: '100%', height: '100%' }}> 
  <Plugin plugin={model.molstar.plugin} />
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
  const viewerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const model = useModel();
  const searchState = useBehavior(model.state.search);
  
  // Handle one-time symbol registration
  useEffect(() => {
    if (!window.molstar || symbolsRegistered) return;
    
    try {
      // Register any required symbols here
      symbolsRegistered = true;
    } catch (err) {
      console.error('Failed to register Mol* symbols:', err);
    }
  }, []);
  
  // Initialize viewer
  useEffect(() => {
    let mounted = true;

    const initViewer = async () => {
      if (!containerRef.current || !window.molstar) return;

      try {
        const viewer = await window.molstar.Viewer.create(
          containerRef.current,
          { 
            layoutIsExpanded: false, 
            layoutShowControls: false,
            layoutShowLeftPanel: false,
            layoutShowRightPanel: false
          }
        );

        if (!mounted) {
          viewer.plugin.dispose();
          return;
        }

        viewerRef.current = viewer;

        const { result } = searchState;
        if (result.type === 'result' && result.value?.id) {
          const pdbId = result.value.id;
          try {
            await viewer.plugin.clear();
            await viewer.loadStructureFromUrl(
              `https://www.ebi.ac.uk/pdbe/entry-files/download/${pdbId}_updated.cif`,
              'mmcif'
            );
            viewer.plugin.representation.update({ type: 'cartoon' });
          } catch (err) {
            console.error('Failed to load structure:', err);
            setError(`Failed to load structure: ${err}`);
          }
        }
      } catch (err) {
        console.error('Failed to initialize viewer:', err);
        setError(`Failed to initialize viewer: ${err}`);
      }
    };

    initViewer();

    return () => {
      mounted = false;
      if (viewerRef.current) {
        viewerRef.current.plugin.dispose();
        viewerRef.current = null;
      }
    };
  }, [searchState]);

  // Watch for search state changes
  useEffect(() => {
    const { result } = searchState;
    if (!result || result.type !== 'result' || !result.value?.id || !viewerRef.current) return;
    const pdbId = result.value.id;

    const loadStructure = async () => {
      try {
        const viewer = viewerRef.current;
        await viewer.plugin.clear();
        await viewer.loadStructureFromUrl(
          `https://www.ebi.ac.uk/pdbe/entry-files/download/${pdbId}_updated.cif`,
          'mmcif'
        );
      } catch (err) {
        console.error('Failed to load structure:', err);
        setError(`Failed to load structure: ${err}`);
      }
    };

    loadStructure();
  }, [searchState]);

  return (
    <div className="viewer-container panel">
      <div className="panel-header">Structure Viewer</div>
      {error && <div className="error-display">{error}</div>}
      <div ref={containerRef} style={{ width, height }} />
    </div>
  );
});

export default MolstarViewer;
