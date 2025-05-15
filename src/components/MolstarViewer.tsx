import React, { useEffect, useRef } from 'react';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { Asset } from 'molstar/lib/mol-util/assets';
import { PluginConfig } from 'molstar/lib/mol-plugin/config';
import 'molstar/lib/mol-plugin-ui/skin/light.scss';

interface MolstarViewerProps {
  width?: number | string;
  height?: number | string;
  pdbUrl?: string;
  mvsData?: any;
  options?: {
    hideControls?: boolean;
    hideToolbar?: boolean;
    hidSequence?: boolean;
  };
}

// Maintain a single global plugin instance
let globalPlugin: PluginUIContext | null = null;

const MolstarViewer: React.FC<MolstarViewerProps> = ({
  width = '100%',
  height = '100%',
  pdbUrl,
  mvsData,
  options = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevPdbUrlRef = useRef(pdbUrl);
  const prevMvsDataRef = useRef(mvsData);
  
  // Create or initialize plugin on mount
  useEffect(() => {
    // Make sure container exists
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    // Create a separate div inside the container for the plugin
    const pluginContainer = document.createElement('div');
    pluginContainer.style.width = '100%';
    pluginContainer.style.height = '100%';
    
    // Clear container and append the plugin container
    container.innerHTML = '';
    container.appendChild(pluginContainer);
    
    // Initialize plugin
    const initPlugin = async () => {
      // Clean up existing plugin if needed
      if (globalPlugin) {
        globalPlugin.dispose();
        globalPlugin = null;
      }
      
      // Create spec
      const spec = DefaultPluginUISpec();
      spec.config = [
        [PluginConfig.Viewport.ShowExpand, !options.hideControls],
        [PluginConfig.Viewport.ShowControls, !options.hideControls],
        [PluginConfig.Viewport.ShowSelectionMode, !options.hideControls],
        [PluginConfig.Viewport.ShowAnimation, !options.hideControls],
      ];
      
      try {
        // Initialize plugin with required render function
        globalPlugin = await createPluginUI({
          target: pluginContainer,
          render: renderReact18,
          spec
        });
        
        // Load data
        if (mvsData) {
          loadMVSData(mvsData);
        } else if (pdbUrl) {
          loadPDBData(pdbUrl);
        }
      } catch (error) {
        console.error('Error initializing plugin:', error);
      }
    };
    
    initPlugin();
    
    // Cleanup on unmount
    return () => {
      if (globalPlugin) {
        globalPlugin.dispose();
        globalPlugin = null;
      }
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []); // Only run on mount
  
  // Handle prop changes
  useEffect(() => {
    // Skip if plugin not initialized or no real changes
    if (!globalPlugin || 
        (pdbUrl === prevPdbUrlRef.current && mvsData === prevMvsDataRef.current)) {
      return;
    }
    
    // Update data based on props
    const updateData = async () => {
      if (mvsData) {
        loadMVSData(mvsData);
      } else if (pdbUrl) {
        loadPDBData(pdbUrl);
      }
    };
    
    updateData();
    
    // Update previous values
    prevPdbUrlRef.current = pdbUrl;
    prevMvsDataRef.current = mvsData;
  }, [pdbUrl, mvsData]);
  
  // Load PDB data
  const loadPDBData = async (url: string | undefined) => {
    if (!globalPlugin || !url) return;
    
    try {
      // Clear previous data
      await globalPlugin.clear();
      
      // Load structure
      const data = await globalPlugin.builders.data.download({
        url: Asset.Url(url)
      });
      
      // Determine format based on extension
      const format = url.endsWith('.pdb') 
        ? 'pdb' 
        : url.endsWith('.cif') || url.endsWith('.mmcif') 
          ? 'mmcif' 
          : 'mmcif';
      
      // Parse and display
      const trajectory = await globalPlugin.builders.structure.parseTrajectory(data, format);
      await globalPlugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');
    } catch (error) {
      console.error('Error loading PDB data:', error);
    }
  };
  
  // Load MVS data
  const loadMVSData = async (data: any) => {
    if (!globalPlugin) return;
    
    try {
      // Clear previous data
      await globalPlugin.clear();
      
      // Try to use PDB URL from MVS data if available
      try {
        const pdbUrl = data?.tree?.structure?.cell?.props?.source?.params?.url;
        if (pdbUrl && typeof pdbUrl === 'string') {
          await loadPDBData(pdbUrl);
          return;
        }
      } catch (e) {
        console.warn('Could not extract PDB URL from MVS data');
      }
      
      // Fallback to direct PDB loading if specified in props
      if (pdbUrl) {
        await loadPDBData(pdbUrl);
      }
    } catch (error) {
      console.error('Error loading MVS data:', error);
      
      // Try using pdbUrl as fallback if available
      if (pdbUrl) {
        await loadPDBData(pdbUrl);
      }
    }
  };
  
  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        position: 'relative'
      }}
    />
  );
};

export default MolstarViewer; 