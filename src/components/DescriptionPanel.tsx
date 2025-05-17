import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useModel, useBehavior } from '../model';

const DescriptionPanel: React.FC = () => {
  const model = useModel();
  const searchResult = useBehavior(model.state.currentResult);
  const isLoading = useBehavior(model.state.isLoading);
  const error = useBehavior(model.state.error);
  
  const { title, description } = searchResult?.structureInfo || {};

  return (
    <div className="description-panel">
      {isLoading && (
        <div className="loading">Loading structure information...</div>
      )}
      
      {error && (
        <div className="error-display">{error}</div>
      )}
      
      {!isLoading && !searchResult ? (
        <p>Select a structure to view details</p>
      ) : !isLoading && searchResult ? (
        <div className="description-content">
          {title && (
            <div className="description-item">
              <span className="description-label">Title:</span>
              <span className="description-value">{title}</span>
            </div>
          )}
          
          {description && (
            <div className="description-item description-markdown">
              <span className="description-label">Description:</span>
              <div className="description-value">
                <ReactMarkdown>{description}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default DescriptionPanel; 