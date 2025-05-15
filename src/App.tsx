import MolstarViewer from "./components/MolstarViewer";
import Search from "./components/Search";
import Description from "./components/Description";
import { useState, useEffect } from "react";

function App() {
  const [contentHeight, setContentHeight] = useState<string | number>('100vh');
  
  useEffect(() => {
    // Set an explicit height to prevent layout shifts
    setContentHeight('calc(100vh - 10px)');
    
    const handleResize = () => {
      setContentHeight('calc(100vh - 10px)');
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="App" style={{ 
      display: 'flex', 
      width: '100%', 
      height: contentHeight,
      overflow: 'hidden'
    }}>
      {/* Search on the left (20%) */}
      <div style={{ 
        width: '20%', 
        height: '100%', 
        borderRight: '1px solid #ddd',
        overflow: 'auto'
      }}>
        <Search />
      </div>
      
      {/* MolstarViewer in the middle (60%) */}
      <div style={{ 
        flex: 1, 
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <MolstarViewer 
          pdbUrl="https://files.rcsb.org/download/4HHB.pdb"
        />
      </div>
      
      {/* Description on the right (20%) */}
      <div style={{ 
        width: '20%', 
        height: '100%', 
        borderLeft: '1px solid #ddd',
        overflow: 'auto'
      }}>
        <Description />
      </div>
    </div>
  );
}

export default App;
