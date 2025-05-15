import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { Asset } from 'molstar/lib/mol-util/assets';
import { PluginConfig } from 'molstar/lib/mol-plugin/config';

/**
 * Options for configuring the Molstar plugin
 */
export interface MolstarPluginOptions {
  /**
   * Whether to hide the control UI elements
   */
  hideControls?: boolean;
  
  /**
   * Whether to hide the toolbar
   */
  hideToolbar?: boolean;
  
  /**
   * Whether to hide the sequence viewer
   */
  hideSequence?: boolean;
}

/**
 * A manager class that encapsulates Molstar plugin functionality
 * and handles lifecycle and data loading
 */
export class MolstarPluginManager {
  private static instance: MolstarPluginManager;
  private plugin: PluginUIContext | null = null;
  private container: HTMLElement | null = null;
  private pluginContainer: HTMLElement | null = null;
  private initialized = false;
  private initializationInProgress = false;
  
  /**
   * Get the singleton instance of the plugin manager
   */
  public static getInstance(): MolstarPluginManager {
    if (!MolstarPluginManager.instance) {
      MolstarPluginManager.instance = new MolstarPluginManager();
    }
    return MolstarPluginManager.instance;
  }
  
  /**
   * Initialize the Molstar plugin in the given container
   * @param container - The HTML element to host the plugin
   * @param options - Configuration options
   * @returns Promise that resolves when initialization is complete
   */
  public async initialize(container: HTMLElement, options: MolstarPluginOptions = {}): Promise<void> {
    // Prevent multiple simultaneous initialization attempts
    if (this.initializationInProgress) {
      console.log('Initialization already in progress, waiting...');
      return new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (!this.initializationInProgress) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    }
    
    this.initializationInProgress = true;
    
    try {
      // If we're already initialized with a different container, dispose first
      if (this.initialized && this.container !== container) {
        await this.dispose();
      }
      
      // Set container reference
      this.container = container;
      
      // If already initialized with this container, just return
      if (this.initialized && this.plugin) {
        this.initializationInProgress = false;
        return;
      }
      
      // Create a plugin container div that we'll keep track of
      this.pluginContainer = document.createElement('div');
      this.pluginContainer.style.width = '100%';
      this.pluginContainer.style.height = '100%';
      this.pluginContainer.className = 'molstar-plugin-container';
      
      // Clear the container safely before appending
      this.safelyEmptyElement(container);
      
      // Append our plugin div to the container
      container.appendChild(this.pluginContainer);
      
      // Configure plugin
      const spec = DefaultPluginUISpec();
      spec.config = [
        [PluginConfig.Viewport.ShowExpand, !options.hideControls],
        [PluginConfig.Viewport.ShowControls, !options.hideControls],
        [PluginConfig.Viewport.ShowSelectionMode, !options.hideControls],
        [PluginConfig.Viewport.ShowAnimation, !options.hideControls],
      ];
      
      // Create the plugin with required renderer
      this.plugin = await createPluginUI({
        target: this.pluginContainer,
        render: renderReact18,
        spec
      });
      
      this.initialized = true;
      
      // Make the plugin globally available for debugging (optional)
      if (typeof window !== 'undefined') {
        (window as any).molstar = this.plugin;
      }
    } catch (error) {
      console.error('Error initializing Molstar plugin:', error);
      this.initialized = false;
      this.plugin = null;
      throw error;
    } finally {
      this.initializationInProgress = false;
    }
  }
  
  /**
   * Safely remove all child nodes from an element
   */
  private safelyEmptyElement(element: HTMLElement): void {
    if (!element) return;
    
    try {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    } catch (error) {
      console.warn('Error clearing element children:', error);
    }
  }
  
  /**
   * Check if the plugin is initialized
   */
  public isInitialized(): boolean {
    return this.initialized && this.plugin !== null;
  }
  
  /**
   * Get the plugin instance
   */
  public getPlugin(): PluginUIContext | null {
    return this.plugin;
  }
  
  /**
   * Load a molecular structure from a PDB URL
   * @param url - URL of the PDB file
   */
  public async loadPdbStructure(url: string): Promise<void> {
    if (!this.plugin || !this.initialized) {
      throw new Error('Plugin not initialized');
    }
    
    try {
      // Clear any existing data
      await this.plugin.clear();
      
      // Download the data
      const data = await this.plugin.builders.data.download({
        url: Asset.Url(url)
      });
      
      // Determine format based on file extension
      const format = url.endsWith('.pdb') 
        ? 'pdb' 
        : url.endsWith('.cif') || url.endsWith('.mmcif') 
          ? 'mmcif' 
          : 'mmcif'; // Default to mmcif
      
      // Parse the data and create a molecular structure
      const trajectory = await this.plugin.builders.structure.parseTrajectory(data, format);
      await this.plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');
    } catch (error) {
      console.error('Error loading PDB structure:', error);
      throw error;
    }
  }
  
  /**
   * Extract PDB URL from MVS data and load the structure
   * @param data - MVS data structure
   */
  public async loadMvsData(data: any): Promise<void> {
    if (!this.plugin || !this.initialized) {
      throw new Error('Plugin not initialized');
    }
    
    try {
      // Clear existing data
      await this.plugin.clear();
      
      // Try to use state tree approach first (might fail with complex MVS)
      try {
        const builder = this.plugin.state.data.build();
        await builder.toRoot().apply(data);
        await builder.commit();
        return;
      } catch (e) {
        console.warn('Could not apply MVS data directly, trying to extract PDB URL', e);
      }
      
      // Extract PDB URL from MVS data and load it instead
      try {
        // Try different common MVS data structures
        let pdbUrl = null;
        if (data?.tree?.structure?.cell?.props?.source?.params?.url) {
          pdbUrl = data.tree.structure.cell.props.source.params.url;
        } else if (data?.tree?.root?.children?.[0]?.cell?.props?.source?.params?.url) {
          pdbUrl = data.tree.root.children[0].cell.props.source.params.url;
        } else if (data?.structure?.url) {
          pdbUrl = data.structure.url;
        }
          
        if (pdbUrl && typeof pdbUrl === 'string') {
          await this.loadPdbStructure(pdbUrl);
          return;
        }
        
        throw new Error('Could not find valid PDB URL in MVS data');
      } catch (e) {
        console.error('Could not extract PDB URL from MVS data', e);
        throw new Error('Failed to process MVS data');
      }
    } catch (error) {
      console.error('Error loading MVS data:', error);
      throw error;
    }
  }
  
  /**
   * Dispose of the plugin and free resources
   */
  public async dispose(): Promise<void> {
    // Clear any async operations that might still try to access the plugin
    await new Promise(resolve => setTimeout(resolve, 10));
    
    if (this.plugin) {
      try {
        this.plugin.dispose();
      } catch (error) {
        console.warn('Error disposing plugin:', error);
      } finally {
        this.plugin = null;
      }
    }
    
    if (this.pluginContainer && this.pluginContainer.parentNode) {
      try {
        this.pluginContainer.parentNode.removeChild(this.pluginContainer);
      } catch (error) {
        console.warn('Error removing plugin container:', error);
      }
    }
    
    if (this.container) {
      this.safelyEmptyElement(this.container);
      this.container = null;
    }
    
    this.pluginContainer = null;
    this.initialized = false;
    
    if (typeof window !== 'undefined') {
      delete (window as any).molstar;
    }
  }
}

// Export a default instance for easy access
export default MolstarPluginManager.getInstance(); 