import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import pluginManager, { MolstarPluginOptions } from './MolstarPluginManager';

/**
 * The shape of the Molstar context
 */
interface MolstarContextType {
  /** The Molstar plugin instance */
  plugin: PluginUIContext | null;
  /** Whether the plugin is currently loading data */
  loading: boolean;
  /** Any error that occurred during loading or initialization */
  error: Error | null;
  /** Load a structure from a PDB URL */
  loadPdbStructure: (url: string) => Promise<void>;
  /** Load a structure from MVS data */
  loadMvsData: (data: any) => Promise<void>;
  /** Check if the plugin is initialized */
  isInitialized: () => boolean;
  /** Initialize the plugin with a container element */
  initializePlugin: (container: HTMLElement) => Promise<void>;
}

// Create the context with default values
const MolstarContext = createContext<MolstarContextType>({
  plugin: null,
  loading: false,
  error: null,
  loadPdbStructure: async () => {},
  loadMvsData: async () => {},
  isInitialized: () => false,
  initializePlugin: async () => {},
});

/**
 * Props for the MolstarProvider component
 */
interface MolstarProviderProps {
  /** React children components */
  children: ReactNode;
  /** Options for configuring the Molstar plugin */
  options?: MolstarPluginOptions;
}

/**
 * Provider component that makes Molstar state available to child components
 */
export const MolstarProvider: React.FC<MolstarProviderProps> = ({ 
  children, 
  options = {} 
}) => {
  const [plugin, setPlugin] = useState<PluginUIContext | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Get the current plugin instance whenever it changes
  useEffect(() => {
    setPlugin(pluginManager.getPlugin());
  }, []);
  
  /**
   * Initialize the plugin with a container element
   */
  const initializePlugin = async (container: HTMLElement) => {
    setLoading(true);
    setError(null);
    
    try {
      await pluginManager.initialize(container, options);
      setPlugin(pluginManager.getPlugin());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize plugin'));
      console.error('Error initializing plugin:', err);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Load a structure from a PDB URL
   */
  const loadPdbStructure = async (url: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await pluginManager.loadPdbStructure(url);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load structure'));
      console.error('Error loading PDB structure:', err);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Load a structure from MVS data
   */
  const loadMvsData = async (data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      await pluginManager.loadMvsData(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load MVS data'));
      console.error('Error loading MVS data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Check if the plugin is initialized
   */
  const isInitialized = () => {
    return pluginManager.isInitialized();
  };
  
  // Create the context value
  const contextValue: MolstarContextType = {
    plugin,
    loading,
    error,
    loadPdbStructure,
    loadMvsData,
    isInitialized,
    initializePlugin,
  };
  
  return (
    <MolstarContext.Provider value={contextValue}>
      {children}
    </MolstarContext.Provider>
  );
};

/**
 * Custom hook for accessing the Molstar context
 */
export const useMolstar = () => {
  const context = useContext(MolstarContext);
  
  if (context === undefined) {
    throw new Error('useMolstar must be used within a MolstarProvider');
  }
  
  return context;
};

export default MolstarContext; 