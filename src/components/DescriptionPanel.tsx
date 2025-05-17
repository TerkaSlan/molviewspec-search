import React from 'react';

interface StructureInfo {
  id?: string;
  title?: string;
  authors?: string;
  resolution?: string;
  releaseDate?: string;
  method?: string;
}

interface DescriptionPanelProps {
  structureInfo?: StructureInfo;
}

const DescriptionPanel: React.FC<DescriptionPanelProps> = ({ 
  structureInfo = {} 
}) => {
  const { id, title, authors, resolution, releaseDate, method } = structureInfo;

  return (
    <div className="description-panel">
      {!id ? (
        <p>Select a structure to view details</p>
      ) : (
        <div className="description-content">
          <div className="description-item">
            <span className="description-label">PDB ID:</span>
            <span className="description-value">{id}</span>
          </div>
          
          {title && (
            <div className="description-item">
              <span className="description-label">Title:</span>
              <span className="description-value">{title}</span>
            </div>
          )}
          
          {authors && (
            <div className="description-item">
              <span className="description-label">Authors:</span>
              <span className="description-value">{authors}</span>
            </div>
          )}
          
          {resolution && (
            <div className="description-item">
              <span className="description-label">Resolution:</span>
              <span className="description-value">{resolution}</span>
            </div>
          )}
          
          {releaseDate && (
            <div className="description-item">
              <span className="description-label">Release Date:</span>
              <span className="description-value">{releaseDate}</span>
            </div>
          )}
          
          {method && (
            <div className="description-item">
              <span className="description-label">Method:</span>
              <span className="description-value">{method}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DescriptionPanel; 