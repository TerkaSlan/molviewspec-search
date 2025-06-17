import { BehaviorSubject, Observable, throttleTime, map, filter } from 'rxjs';
import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { loadMVSData } from 'molstar/lib/extensions/mvs/components/formats';
import { PluginSpec } from 'molstar/lib/mol-plugin/spec';
import { MolViewSpec } from 'molstar/lib/extensions/mvs/behavior';
import { PluginConfig } from 'molstar/lib/mol-plugin/config';
import { MVSData, Snapshot } from 'molstar/lib/extensions/mvs/mvs-data';

/**
 * Interface representing structure information and metadata
 * @interface StructureInfo
 * @property {string} [title] - The title of the structure
 * @property {string} [mvsDescription] - MVS-generated description of the structure
 */
export interface StructureInfo {
  title?: string;
  mvsDescription?: string;
}

/**
 * Interface representing a structure  searchresult
 * @interface SearchResult
 * @property {string} id - The identifier of the structure (e.g., PDB ID)
 * @property {StructureInfo} structureInfo - Metadata and information about the structure
 */
export interface SearchResult {
  id: string;
  structureInfo: StructureInfo;
}

/**
 * Custom hook to use RxJS BehaviorSubject as React state
 * @template T - The type of the value in the BehaviorSubject
 * @param {BehaviorSubject<T>} subject - The BehaviorSubject to observe
 * @returns {T} The current value of the BehaviorSubject
 */
export function useBehavior<T>(subject: BehaviorSubject<T>): T {
  const [value, setValue] = useState<T>(subject.value);
  
  useEffect(() => {
    const subscription = subject.subscribe(setValue);
    return () => subscription.unsubscribe();
  }, [subject]);
  
  return value;
}

export type AsyncResult<T> =
  | { type: 'loading' }
  | { type: 'error', error: string }
  | { type: 'result', value: T };


class MolStarWrapper {
  private pluginInitialized: (() => void) | null = null;
  readonly initialized = new Promise<void>(res => {
    this.pluginInitialized = res;
  });

  plugin: PluginUIContext = undefined as any;

  private createViewer() {
    const spec = DefaultPluginUISpec();
    const plugin = new PluginUIContext({
      ...spec,
      layout: {
        initial: {
          isExpanded: false,
          showControls: false,
        },
      },
      components: {
        disableDragOverlay: true,
        remoteState: 'none',
      },
      behaviors: [...spec.behaviors, PluginSpec.Behavior(MolViewSpec)],
      config: [
        [PluginConfig.Viewport.ShowAnimation, false],
        [PluginConfig.Viewport.ShowSelectionMode, false],
        [PluginConfig.Viewport.ShowExpand, false],
        [PluginConfig.Viewport.ShowControls, false],
      ],
    });
    return plugin;
  }

  constructor() {
    this.plugin = this.createViewer();
    this.plugin.init().then(() => {
      if (this.pluginInitialized) {
        this.pluginInitialized();
      }
    });
  }

  async waitForInit() {
    await this.initialized;
  }
}

/**
 * Interface representing the search state
 */
export interface SearchState {
  query: string;
  result: AsyncResult<SearchResult | null>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Interface representing the viewer state
 */
export interface ViewerState {
  mvsDescription: string | null;
  currentMVS: MVSData | null;
}

/**
 * Main model class for the MolViewSpec application
 * Manages application state and provides data operations
 * @class MolViewSpecModel
 */

export class MolViewSpecModel {

  readonly molstar = new MolStarWrapper();

  /**
   * Observable state properties for the application
   * @public
   */
  state = {
    /** Search-related state */
    search: new BehaviorSubject<SearchState>({
      query: '',
      result: { type: 'result', value: null },
      isLoading: false,
      error: null
    }),

    /** Viewer-related state */
    viewer: new BehaviorSubject<ViewerState>({
      mvsDescription: null,
      currentMVS: null
    })
  };

  /** Stored subscription cleanup functions */
  private unsubs: (() => void)[] = [];
  
  /**
   * Subscribe to an observable and store the unsubscribe function
   * @template T - The type of the value in the BehaviorSubject
   * @param {BehaviorSubject<T>} obs - The observable to subscribe to
   * @param {(v: T) => void} action - The callback function to execute on value changes
   * @returns {() => void} A function to unsubscribe from the observable
   */
  subscribe<T>(obs: Observable<T>, action: (v: T) => void) {
    const subscription = obs.subscribe(action);
    this.unsubs.push(() => subscription.unsubscribe());
    return () => subscription.unsubscribe();
  }

  /**
   * Clean up all subscriptions
   */
  dispose() {
    this.unsubs.forEach(unsub => unsub());
    this.unsubs = [];
  }

  constructor() {
    this.initialize();
  }

  private async initialize() {
    await this.molstar.waitForInit();
    this.mount();
  }

  mount() {
    // Subscribe to search state changes to trigger structure loading
    this.subscribe(
      this.state.search.pipe(
        map(state => state.result),
        // Only trigger on successful results
        filter(result => result.type === 'result' && result.value !== null)
      ),
      async (result) => {
        if (result.type !== 'result' || !result.value) return;

        try {
          const pdbId = result.value.id;
          const plugin = this.molstar.plugin;
          await plugin.clear();
          
          // Build the MVS
          const MVSData = window.molstar.PluginExtensions.mvs.MVSData;
          const loadMVS = window.molstar.PluginExtensions.mvs.loadMVS;
          
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
          
          const mvsDescription = `### PDB Structure ${pdbId.toUpperCase()}
- Cartoon representation of protein
- Ball and stick representation of ligands`;
          
          const snapshot = builder.getSnapshot({
            title: `${pdbId.toUpperCase()} Structure Visualization`,
            description: mvsDescription,
            timestamp: new Date().toISOString()
          });
          
          // Update viewer state
          this.state.viewer.next({
            mvsDescription,
            currentMVS: snapshot
          });
          
          // Load the MVS
          await loadMVS(plugin, snapshot, { replaceExisting: true });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.state.search.next({
            ...this.state.search.value,
            error: errorMessage
          });
        }
      }
    );
  }

  private currentMVS: any = undefined;

  downloadMVS = () => {
    // download(new Blob([this.currentMVS]), 'mvs.mvsj'); // import from molstar/lib/mol-util/download
  };

  /**
   * Search for a structure by ID
   * @param {string} query - The PDB ID to search for
   * @returns {Promise<void>}
   */
  searchStructure = async () => {
    const currentState = this.state.search.value;
    const query = currentState.query;
    
    if (!query.trim()) return;
    
    // Update loading state
    this.state.search.next({
      ...currentState,
      isLoading: true,
      error: null
    });
    
    try {
      const result = await this.fetchStructureData(query);
      
      // Update the search state with the result
      this.state.search.next({
        ...currentState,
        isLoading: false,
        result: { type: 'result', value: result }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.state.search.next({
        ...currentState,
        isLoading: false,
        error: errorMessage
      });
    }
  }

  /**
   * Simulate fetching structure data (placeholder for API call)
   * @private
   * @param {string} pdbId - The PDB ID to fetch data for
   * @returns {Promise<SearchResult>} The search result containing structure information
   */
  private async fetchStructureData(pdbId: string): Promise<SearchResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Sample structure data based on PDB ID
    const data: Record<string, StructureInfo> = {
      '1cbs': {
        title: 'Cellular retinoic acid-binding protein type 2',
        mvsDescription: `### Cellular Retinoic Acid-Binding Protein Type 2
        
This structure represents the **Cellular Retinoic Acid-Binding Protein Type 2** (CRABP2), which is involved in the transport of retinoic acid to the nucleus.

- Resolution: 1.8Å
- Method: X-ray diffraction
- Authors: Kleywegt, G.J., Bergfors, T., Jones, T.A.
- Released: 1994

The protein shows a β-barrel structure with retinoic acid bound inside.`
      }
    };
    
    // Check if we have data for this PDB ID
    if (data[pdbId.toLowerCase()]) {
      return {
        id: pdbId,
        structureInfo: data[pdbId.toLowerCase()]
      };
    }
    
    // Default data for unknown PDB IDs
    return {
      id: pdbId,
      structureInfo: {
        title: `Structure ${pdbId.toUpperCase()}`,
        mvsDescription: `### PDB Structure ${pdbId.toUpperCase()}
        
No detailed information available for this structure.`
      }
    };
  }
}

/**
 * React context for providing the MolViewSpec model
 */
export const MolViewSpecContext = createContext<MolViewSpecModel | null>(null);

/**
 * Props interface for the ModelProvider component
 * @interface ModelProviderProps
 * @property {ReactNode} children - Child components to be wrapped by the provider
 */
interface ModelProviderProps {
  children: ReactNode;
}

/**
 * Context provider component for the MolViewSpec model
 * Initializes and provides the model to the component tree
 * @param {ModelProviderProps} props - Component props
 * @returns {JSX.Element} Provider component
 */
export const ModelProvider: React.FC<ModelProviderProps> = ({ children }) => {
  const modelRef = useRef<MolViewSpecModel | null>(null);
  if (!modelRef.current) {
    modelRef.current = new MolViewSpecModel();
  }
  const model = modelRef.current;

  useEffect(() => {
    return () => {
      model.dispose();
    };
  }, [model]);
  
  return (
    <MolViewSpecContext.Provider value={model}>
      {children}
    </MolViewSpecContext.Provider>
  );
};

/**
 * Custom hook to access the MolViewSpec model
 * @returns {MolViewSpecModel} The MolViewSpec model instance
 * @throws {Error} If used outside of a ModelProvider
 */
export function useModel() {
  const context = useContext(MolViewSpecContext);
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
}

/**
 * Creates selectors for deriving state from the model
 * @param model The MolViewSpecModel instance
 * @returns Object containing selector functions
 */
export const createSelectors = (model: MolViewSpecModel) => ({
  isLoading: () => model.state.search.pipe(
    map(state => state.isLoading)
  ),
  hasError: () => model.state.search.pipe(
    map(state => !!state.error)
  )
});