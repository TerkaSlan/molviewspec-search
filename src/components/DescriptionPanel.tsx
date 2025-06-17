import React, { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useModel, useBehavior, createSelectors } from '../model';

/**
 * DescriptionPanel component for displaying structure metadata and descriptions
 * Shows structure title, MVS-generated descriptions, and provides download functionality
 * 
 * @component
 * @returns {JSX.Element} The DescriptionPanel component
 */
const DescriptionPanel: React.FC = () => {
  const model = useModel();
  const selectors = createSelectors(model);
  
  // Subscribe to derived states
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const loadingSub = selectors.isLoading().subscribe(setIsLoading);
    const errorSub = selectors.hasError().subscribe(setHasError);
    return () => {
      loadingSub.unsubscribe();
      errorSub.unsubscribe();
    };
  }, [selectors]);

  const searchState = useBehavior(model.state.search);
  const viewerState = useBehavior(model.state.viewer);
  
  const { result: searchResult } = searchState;
  const { mvsDescription, currentMVS } = viewerState;
  
  const { title } = searchResult.type === 'result' && searchResult.value?.structureInfo || {};

  /**
   * Download the current MVS data as an MVSJ file
   * Creates a temporary link and triggers a file download in the browser
   */
  const handleDownloadMVS = useCallback(() => {
    if (!currentMVS || !searchResult || searchResult.type !== 'result') return;
    
    try {
      // Get the MVSJ string representation
      const mvsj = window.molstar.PluginExtensions.mvs.MVSData.toMVSJ(currentMVS);
      
      // Create a blob and download link
      const blob = new Blob([mvsj], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link element
      const a = document.createElement('a');
      a.href = url;
      a.download = `${searchResult.value?.id || 'structure'}.mvsj`;
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
      {searchResult.type === 'loading' && (
        <div className="loading">Loading structure information...</div>
      )}
      
      {hasError && (
        <div className="error-display">Error loading structure information</div>
      )}
      
      {!isLoading && !searchResult ? (
        <p>Select a structure to view details</p>
      ) : !isLoading && searchResult.type === 'result' ? (
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