import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { Asset } from 'molstar/lib/mol-util/assets';
import { PluginConfig } from 'molstar/lib/mol-plugin/config';
import { PluginConfig as PluginConfigType } from 'molstar/lib/mol-plugin/config';
import { StructureRepresentationPresetProvider } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset';
import { MVSData } from 'molstar/lib/extensions/mvs/mvs-data';
import { loadMVS } from 'molstar/lib/extensions/mvs/load';
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
      
      // Register the MVS extension explicitly after plugin creation
      if (this.plugin) {
        try {
          // Check if loadMVS function is already available
          console.log('Checking if loadMVS function is properly available...');
          
          // If loadMVS function is available and properly defined, we can assume the extension is loaded
          if (typeof loadMVS === 'function') {
            console.log('loadMVS function is available, extension should be pre-loaded');
          } else {
            console.warn('loadMVS function is not available, MVS extension might not be properly loaded');
            // We cannot dynamically import or register the extension due to module resolution issues
            // This requires proper bundling of the MVS extension with Molstar
          }
        } catch (e) {
          console.warn('Could not verify MVS extension:', e);
        }
      }
      
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
   * Load an MVS data structure and visualize it
   * @param data - MVS data structure
   */
  public async loadMvsData(data: any): Promise<void> {
    if (!this.plugin || !this.initialized) {
      throw new Error('Plugin not initialized');
    }
    
    try {
      // Clear existing data
      await this.plugin.clear();
      
      try {
        console.log('Attempting to load MVS data...');
        
        // First, try to load using global Molstar extensions if available
        if (typeof window !== 'undefined' && 
            (window as any).molstar && 
            (window as any).molstar.PluginExtensions && 
            (window as any).molstar.PluginExtensions.mvs &&
            typeof (window as any).molstar.PluginExtensions.mvs.loadMVS === 'function') {
          
          console.log('Using global Molstar MVS extension');
          await (window as any).molstar.PluginExtensions.mvs.loadMVS(this.plugin, data);
        } 
        // If not available globally, try the imported function
        else if (typeof loadMVS === 'function') {
          console.log('Using imported loadMVS function');
          
          // Build a sample MVS data directly
          const builder2 = MVSData.createBuilder();
          const structure2 = builder2.download({ url: 'https://www.ebi.ac.uk/pdbe/entry-files/download/1og2_updated.cif' }).parse({ format: 'mmcif' }).modelStructure();
          structure2.component({ selector: 'polymer' }).representation({ type: 'cartoon' });
          structure2.component({ selector: 'ligand' }).representation({ type: 'ball_and_stick' }).color({ color: '#aa55ff' });
          const mvsData2 = builder2.getState();
          console.log('mvsData2', mvsData2);
          // Use the directly imported loadMVS function
          await loadMVS(this.plugin, mvsData2, { replaceExisting: false });
        } 
        else {
          throw new Error('MVS extension not properly loaded');
        }
        
        console.log('Successfully loaded MVS data');
      } catch (e: any) {
        console.error('Error loading MVS data with loadMVS:', e);
      }
    } catch (error) {
      console.error('Error in loadMvsData:', error);
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