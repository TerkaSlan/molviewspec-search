import { useEffect, useRef } from "react";
import { createPluginUI } from "molstar/lib/mol-plugin-ui";
import { renderReact18 } from "molstar/lib/mol-plugin-ui/react18";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import "molstar/lib/mol-plugin-ui/skin/light.scss";

interface MolstarViewerProps {
  width?: number | string;
  height?: number | string;
  pdbUrl?: string;
}

declare global {
  interface Window {
    molstar?: PluginUIContext;
  }
}

const MolstarViewer: React.FC<MolstarViewerProps> = ({ 
  width = '100%', 
  height = '100%', 
  pdbUrl = "https://files.rcsb.org/download/3PTB.pdb" 
}) => {
  const parent = useRef<HTMLDivElement>(null);
  const pluginInitialized = useRef(false);

  useEffect(() => {
    // Skip if already initialized or no container
    if (pluginInitialized.current || !parent.current) return;
    
    let mounted = true;
    pluginInitialized.current = true;
    
    async function init() {
      try {
        if (!parent.current || !mounted) return;
        
        window.molstar = await createPluginUI({
          target: parent.current,
          render: renderReact18
        });

        if (!mounted || !window.molstar) return;

        const data = await window.molstar.builders.data.download(
          { url: pdbUrl },
          { state: { isGhost: true } }
        );
        
        if (!mounted || !window.molstar) return;
        
        const trajectory =
          await window.molstar.builders.structure.parseTrajectory(data, "pdb");
        
        if (!mounted || !window.molstar) return;
        
        await window.molstar.builders.structure.hierarchy.applyPreset(
          trajectory,
          "default"
        );
      } catch (error) {
        console.error("Error initializing molstar:", error);
        pluginInitialized.current = false;
      }
    }
    
    init();
    
    return () => {
      mounted = false;
      if (window.molstar) {
        window.molstar.dispose();
        window.molstar = undefined;
      }
      pluginInitialized.current = false;
    };
  }, [pdbUrl]);

  return (
    <div className="molstar-container" style={{ 
      width, 
      height,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      <div ref={parent} style={{ 
        width: '100%',
        height: '100%'
      }}/>
    </div>
  );
};

export default MolstarViewer; 