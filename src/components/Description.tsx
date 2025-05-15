import React, { useState, useEffect } from 'react';

interface DescriptionProps {
  pdbId: string;
}

interface PdbInfo {
  title: string;
  authors: string;
  citation: string;
  resolution?: string;
  releaseDate: string;
  experimentalMethod: string;
}

const Description: React.FC<DescriptionProps> = ({ pdbId }) => {
  const [pdbInfo, setPdbInfo] = useState<PdbInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPdbInfo = async () => {
      if (!pdbId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Using the RCSB PDB API to get structure information
        const response = await fetch(`https://data.rcsb.org/rest/v1/core/entry/${pdbId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data for PDB ID: ${pdbId}`);
        }
        
        const data = await response.json();
        
        // Extract relevant information
        setPdbInfo({
          title: data.struct?.title || 'No title available',
          authors: data.audit_author?.[0]?.name || 'Unknown authors',
          citation: data.citation?.[0]?.rcsb_authors_list?.join(', ') || 'No citation available',
          resolution: data.refine?.[0]?.ls_d_res_high || 'Not available',
          releaseDate: data.rcsb_accession_info?.initial_release_date || 'Unknown',
          experimentalMethod: data.experiment?.method || 'Not specified'
        });
      } catch (err) {
        console.error('Error fetching PDB info:', err);
        setError('Failed to load structure information. The PDB ID may be invalid or the service is unavailable.');
        setPdbInfo(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPdbInfo();
  }, [pdbId]);
  
  return (
    <div className="description-panel">
      <h2>Structure Details</h2>
      
      {loading && <p className="loading">Loading structure information...</p>}
      
      {error && <p className="error">{error}</p>}
      
      {!loading && !error && pdbInfo && (
        <div className="pdb-details">
          <h3>PDB ID: {pdbId.toUpperCase()}</h3>
          
          <div className="detail-section">
            <h4>Title:</h4>
            <p>{pdbInfo.title}</p>
          </div>
          
          <div className="detail-section">
            <h4>Authors:</h4>
            <p>{pdbInfo.authors}</p>
          </div>
          
          {pdbInfo.resolution && (
            <div className="detail-section">
              <h4>Resolution:</h4>
              <p>{pdbInfo.resolution} Å</p>
            </div>
          )}
          
          <div className="detail-section">
            <h4>Method:</h4>
            <p>{pdbInfo.experimentalMethod}</p>
          </div>
          
          <div className="detail-section">
            <h4>Release Date:</h4>
            <p>{pdbInfo.releaseDate}</p>
          </div>
          
          <div className="detail-section">
            <h4>Citation:</h4>
            <p>{pdbInfo.citation}</p>
          </div>
        </div>
      )}
      
      {!loading && !error && !pdbInfo && (
        <p>No information available for PDB ID: {pdbId}</p>
      )}
      
      <div className="external-links">
        <h3>External Resources</h3>
        <ul>
          <li>
            <a href={`https://www.rcsb.org/structure/${pdbId}`} target="_blank" rel="noopener noreferrer">
              View on RCSB PDB
            </a>
          </li>
          <li>
            <a href={`https://www.ebi.ac.uk/pdbe/entry/pdb/${pdbId}`} target="_blank" rel="noopener noreferrer">
              View on PDBe
            </a>
          </li>
          <li>
            <a href={`https://www.ncbi.nlm.nih.gov/structure/?term=${pdbId}`} target="_blank" rel="noopener noreferrer">
              Search on NCBI Structure
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Description; 