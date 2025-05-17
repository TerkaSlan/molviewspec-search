import React, { useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useModel, useBehavior } from '../model';

/**
 * DescriptionPanel component for displaying structure metadata and descriptions
 * Shows structure title, MVS-generated descriptions, and provides download functionality
 * 
 * @component
 * @returns {JSX.Element} The DescriptionPanel component
 */
const DescriptionPanel: React.FC = () => {
  const model = useModel();
  const searchResult = useBehavior(model.state.currentResult);
  const isLoading = useBehavior(model.state.isLoading);
  const error = useBehavior(model.state.error);
  const mvsDescription = useBehavior(model.state.mvsDescription);
  const currentMVS = useBehavior(model.state.currentMVS);
  
  const { title } = searchResult?.structureInfo || {};

  /**
   * Download the current MVS data as an MVSJ file
   * Creates a temporary link and triggers a file download in the browser
   */
  const handleDownloadMVS = useCallback(() => {
    if (!currentMVS || !searchResult) return;
    
    try {
      // Get the MVSJ string representation
      const mvsj = window.molstar.PluginExtensions.mvs.MVSData.toMVSJ(currentMVS);
      
      // Create a blob and download link
      const blob = new Blob([mvsj], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link element
      const a = document.createElement('a');
      a.href = url;
      a.download = `${searchResult.id || 'structure'}.mvsj`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download MVS:', err);
    }
  }, [currentMVS, searchResult]);

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
          
          {mvsDescription && (
            <div className="description-item description-markdown">
              <span className="description-label">MVS Description:</span>
              <div className="description-value">
                <ReactMarkdown>{mvsDescription}</ReactMarkdown>
              </div>
            </div>
          )}
          
          {currentMVS && (
            <div className="description-item">
              <button 
                className="download-button"
                onClick={handleDownloadMVS}
              >
                Download MVSJ File
              </button>
              <p className="download-hint">
                Download the MolViewSpec JSON for use in other Mol* applications
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default DescriptionPanel; 