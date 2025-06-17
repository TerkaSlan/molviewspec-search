import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useAtomValue } from 'jotai';
import { DescriptionAtom, SearchAtom } from '../app/state/atoms';

/**
 * DescriptionPanel component for displaying structure metadata and descriptions
 * Shows structure title, MVS-generated descriptions, and provides download functionality
 * 
 * @component
 * @returns {JSX.Element} The DescriptionPanel component
 */
const DescriptionPanel: React.FC = () => {
  const { title, description, isLoading } = useAtomValue(DescriptionAtom);
  const { error } = useAtomValue(SearchAtom);

  return (
    <div className="description-panel">
      {isLoading && (
        <div className="loading">Loading structure information...</div>
      )}
      
      {error && (
        <div className="error-display">Error: {error}</div>
      )}
      
      {!isLoading && !title && !description ? (
        <p>Select a structure to view details</p>
      ) : !isLoading ? (
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