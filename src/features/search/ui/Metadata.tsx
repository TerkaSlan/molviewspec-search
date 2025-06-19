import React from 'react';
import { SuperpositionData } from '../types';

interface MetadataProps {
    queryProteinId: string;
    selectedResult: SuperpositionData | null;
}

export function Metadata({ queryProteinId, selectedResult }: MetadataProps) {
    return (
        <div className="metadata-container">
            <div className="metadata-section">
                <h3>Query Protein</h3>
                <p>{queryProteinId}</p>
            </div>
            {selectedResult && (
                <div className="metadata-section">
                    <h3>Target Protein</h3>
                    <p>{selectedResult.object_id}</p>
                    <div className="metrics">
                        <div className="metric">
                            <span className="label">TM-score:</span>
                            <span className="value">{selectedResult.tm_score.toFixed(3)}</span>
                        </div>
                        <div className="metric">
                            <span className="label">RMSD:</span>
                            <span className="value">{selectedResult.rmsd.toFixed(2)} Å</span>
                        </div>
                        <div className="metric">
                            <span className="label">Aligned:</span>
                            <span className="value">{(selectedResult.aligned_percentage * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 