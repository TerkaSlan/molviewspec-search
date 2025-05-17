import { BehaviorSubject } from 'rxjs';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define structure info interface
export interface StructureInfo {
  title?: string;
  description?: string;
  mvsDescription?: string;  // Added to store the MVS-generated description
}

// Structure search result interface
export interface SearchResult {
  id: string;
  structureInfo: StructureInfo;
}

// Custom hook to use BehaviorSubject as React state
export function useBehavior<T>(subject: BehaviorSubject<T>): T {
  const [value, setValue] = useState<T>(subject.value);
  
  useEffect(() => {
    const subscription = subject.subscribe(setValue);
    return () => subscription.unsubscribe();
  }, [subject]);
  
  return value;
}

// Define the model class
export class MolViewSpecModel {
  // Observable state
  state = {
    // Current search query
    searchQuery: new BehaviorSubject<string>(''),
    
    // Current search result
    currentResult: new BehaviorSubject<SearchResult | null>(null),
    
    // Loading state
    isLoading: new BehaviorSubject<boolean>(false),
    
    // Error state
    error: new BehaviorSubject<string | null>(null),
    
    // MVS Description from the viewer
    mvsDescription: new BehaviorSubject<string | null>(null),
    
    // Current MVS snapshot for download
    currentMVS: new BehaviorSubject<any>(null)
  };

  // Subscriptions cleanup
  private unsubs: (() => void)[] = [];
  
  // Subscribe to observables
  subscribe<T>(obs: BehaviorSubject<T>, action: (v: T) => void) {
    const subscription = obs.subscribe(action);
    this.unsubs.push(() => subscription.unsubscribe());
    return () => subscription.unsubscribe();
  }

  // Clean up subscriptions
  dispose() {
    this.unsubs.forEach(unsub => unsub());
    this.unsubs = [];
  }

  // Search for a structure by ID
  async searchStructure(query: string) {
    if (!query.trim()) return;
    
    // Update search query
    this.state.searchQuery.next(query);
    
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

  // Simulate fetching structure data
  private async fetchStructureData(pdbId: string): Promise<SearchResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Sample structure data based on PDB ID
    const data: Record<string, StructureInfo> = {
      '1cbs': {
        title: 'Cellular retinoic acid-binding protein type 2',
        description: `### Cellular Retinoic Acid-Binding Protein Type 2
        
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
        description: `### PDB Structure ${pdbId.toUpperCase()}
        
No detailed information available for this structure.`
      }
    };
  }
}

// Create React context
export const MolViewSpecContext = createContext<MolViewSpecModel | null>(null);

// Provider component
interface ModelProviderProps {
  children: ReactNode;
}

export const ModelProvider: React.FC<ModelProviderProps> = ({ children }) => {
  const [model] = useState(() => new MolViewSpecModel());
  
  useEffect(() => {
    // Load default structure on startup
    model.searchStructure('1cbs');
    
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

// Custom hook to use model
export function useModel() {
  const context = useContext(MolViewSpecContext);
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
} 