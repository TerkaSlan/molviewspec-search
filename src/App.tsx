import React, { useState, useRef } from 'react';
import MolstarViewer from './components/MolstarViewer';
import SearchInput from './components/SearchInput';
import DescriptionPanel from './components/DescriptionPanel';

interface StructureInfo {
  id?: string;
  title?: string;
  authors?: string;
  resolution?: string;
  releaseDate?: string;
  method?: string;
}

const App: React.FC = () => {
  const molstarViewerRef = useRef<any>(null);
  
  const [structureInfo, setStructureInfo] = useState<StructureInfo>({
    id: '1cbs',
    title: 'CELLULAR RETINOIC-ACID-BINDING PROTEIN TYPE II IN COMPLEX WITH SYNTHETIC RETINOID',
    authors: 'Kleywegt, G.J., Bergfors, T., Jones, T.A.',
    resolution: '1.80 Å',
    releaseDate: '1994-08-31',
    method: 'X-RAY DIFFRACTION'
  });

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // In a real application, you would fetch data based on the query
    // For now, we'll just update the structure info if the query matches a known PDB ID
    if (query.toLowerCase() === '1og2') {
      setStructureInfo({
        id: '1og2',
        title: 'Crystal structure of the ligand binding domain of the estrogen receptor',
        authors: 'Warnmark, A., Treuter, E., Gustafsson, J.A., Hubbard, R.E., Brzozowski, A.M.',
        resolution: '2.05 Å',
        releaseDate: '2002-07-09',
        method: 'X-RAY DIFFRACTION'
      });
      
      // Load the structure in the viewer
      if (molstarViewerRef.current && molstarViewerRef.current.loadPdbById) {
        molstarViewerRef.current.loadPdbById('1og2');
      }
    } else if (query.toLowerCase() === '1cbs') {
      setStructureInfo({
        id: '1cbs',
        title: 'CELLULAR RETINOIC-ACID-BINDING PROTEIN TYPE II IN COMPLEX WITH SYNTHETIC RETINOID',
        authors: 'Kleywegt, G.J., Bergfors, T., Jones, T.A.',
        resolution: '1.80 Å',
        releaseDate: '1994-08-31',
        method: 'X-RAY DIFFRACTION'
      });
      
      // Load the structure in the viewer
      if (molstarViewerRef.current && molstarViewerRef.current.loadPdbById) {
        molstarViewerRef.current.loadPdbById('1cbs');
      }
    } else {
      // Try to load the structure directly if it looks like a PDB ID
      if (/^[1-9][a-zA-Z0-9]{3}$/.test(query)) {
        setStructureInfo({
          id: query.toLowerCase(),
          title: `Structure ${query.toLowerCase()}`,
          authors: 'Unknown',
          resolution: 'Unknown',
          releaseDate: 'Unknown',
          method: 'Unknown'
        });
        
        // Attempt to load the structure
        if (molstarViewerRef.current && molstarViewerRef.current.loadPdbById) {
          molstarViewerRef.current.loadPdbById(query.toLowerCase());
        }
      }
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Mol* MolViewSpec Demo</h1>
        <p className="app-subtitle">
          A demonstration of loading and building MolViewSpec views in Mol* viewer
        </p>
      </header>
      
      <div className="main-content">
        <div className="left-panel panel">
          <div className="panel-header">Search</div>
          <SearchInput onSearch={handleSearch} />
        </div>
        
        <div className="center-panel">
          <MolstarViewer 
            width="100%" 
            height="600px" 
            ref={molstarViewerRef}
          />
        </div>
        
        <div className="right-panel panel">
          <div className="panel-header">Structure Info</div>
          <DescriptionPanel structureInfo={structureInfo} />
        </div>
      </div>
      
      <div className="app-footer panel">
        <h2 className="footer-title">About this demo</h2>
        <div className="footer-content">
          <p>
            This demo shows two key functionalities:
          </p>
          <ol className="footer-list">
            <li>Loading a pre-defined MVS file (1cbs.mvsj) from a URL</li>
            <li>Building a custom MVS programmatically for a structure (1og2)</li>
          </ol>
          <p>
            Click on the buttons above to switch between these two views or use the search panel to enter a PDB ID.
            Check the console to see the MVS data that was loaded or built.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
