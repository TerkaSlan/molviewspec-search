import { BehaviorSubject, Observable, throttleTime } from 'rxjs';
import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';

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
 * Interface representing a structure search result
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
  })

  plugin: PluginUIContext = undefined as any;

  private async init() {
    // create plugin spec, await plugin.init(), ...
    this.plugin = new PluginUIContext(spec); // include MVS behavior
    await this.plugin.init();

    this.pluginInitialized?.();
  }
  
  async loadMVS() {
    await this.initialized;
  }

  constructor() {
    this.init();
  }
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
    /** Current search query */
    searchQuery: new BehaviorSubject<string>(''),
    
    /** Current search result */
    result: new BehaviorSubject<AsyncResult<SearchResult | null>>({ 
      type: 'result',
      value: null
    }),
    
    /** Loading state */
    // isLoading: new BehaviorSubject<boolean>(false),
    
    /** Error state */
    // error: new BehaviorSubject<string | null>(null),
    
    /** MVS Description from the viewer */
    mvsDescription: new BehaviorSubject<string | null>(null),
    
    /** Current MVS snapshot for download */
    currentMVS: new BehaviorSubject<any>(null)
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

  mount() {
    // this.subscribe(this.state.searchQuery
    //  .pipe(throttleTime(33, undefined, { leading: false, trailing: true })),
//
  //    (query) => {
    //  this.searchStructure(query);
    //});

    this.subscribe(this.state.result, (res) => {
      if (res.type !== 'result' || !res.value) return;

      const mvs = buildMVSState(res.value);

      this.state.stateDescription.next(mvs.description);
      this.currentMVS = mvs.data;
      this.molstar.loadMVS(mvs.data);
      // loadMVS(this.plugin, mvs)
    });
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
    const query = this.state.searchQuery.value;
    if (!query.trim()) return;
    
    // Update search query
    // this.state.searchQuery.next(query);
    
    // Set loading state
    this.state.isLoading.next(true);
    this.state.error.next(null);
    
    try {
      // In a real application, this would be an API call
      // For now, we'll simulate some data
      const result = await this.fetchStructureData(query);
      
      // Update the current result
      this.state.currentResult.next(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.state.error.next(errorMessage);
    } finally {
      this.state.isLoading.next(false);
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
  // const [model] = useState(() => new MolViewSpecModel());

  const modelRef = useRef<MolViewSpecModel | null>(null);
  if (!modelRef.current) {
    modelRef.current = new MolViewSpecModel();
  }
  const model = modelRef.current;

  useEffect(() => {
    // model.mount(); // init subscriptions

    // Load default structure on startup
    // model.searchStructure('1cbs');
    
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

// creates a singleton model instance
export function useSearchModel() {
  const modelRef = useRef<MolViewSpecModel | null>(null);
  if (!modelRef.current) {
    modelRef.current = new MolViewSpecModel();
  }

  useEffect(() => {
    modelRef.current!.mount();
    return () => {
      modelRef.current!.dispose();
    };
  }, []);

  return modelRef.current;
}