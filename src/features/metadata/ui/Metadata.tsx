import React from 'react';
import { SuperpositionData } from '../../search/types';
import { MetadataModel } from '../models/MetadataModel';
import { useMetadata } from '../hooks/useMetadata';
import './styles.css';

interface MetadataProps {
    queryProteinId: string;
    selectedResult: SuperpositionData | null;
    queryModel: MetadataModel;
    targetModel: MetadataModel;
}

export function Metadata({ queryProteinId, selectedResult, queryModel, targetModel }: MetadataProps) {
    const { metadata: queryMetadata, isLoading: queryLoading, error: queryError } = useMetadata(queryModel);
    const { metadata: targetMetadata, isLoading: targetLoading, error: targetError } = useMetadata(targetModel);

    return (
        <div className="metadata-container">
            <div className="metadata-sections-wrapper">
                <div className="metadata-section">
                    <h3>Query Protein</h3>
                    <p>{queryProteinId}</p>
                    {queryLoading ? (
                        <p>Loading metadata...</p>
                    ) : queryError ? (
                        <p className="error">{queryError}</p>
                    ) : queryMetadata?.structures[0]?.summary ? (
                        <div className="metrics">
                            <div className="metric">
                                <span className="label">UniProt ID:</span>
                                <span className="value">{queryMetadata.structures[0].summary.uniprotId}</span>
                            </div>
                            <div className="metric">
                                <span className="label">Description:</span>
                                <span className="value">{queryMetadata.structures[0].summary.uniprotDescription}</span>
                            </div>
                            <div className="metric">
                                <span className="label">Organism:</span>
                                <span className="value">{queryMetadata.structures[0].summary.organismScientificName}</span>
                            </div>
                            <div className="metric">
                                <span className="label">Length:</span>
                                <span className="value">{queryMetadata.uniprot_entry.sequence_length}</span>
                            </div>
                            <div className="links">
                                <a href={queryMetadata.structures[0].summary.pdbUrl} target="_blank" rel="noopener noreferrer">Download PDB</a>
                                {" | "}
                                <a href={queryMetadata.structures[0].summary.paeImageUrl} target="_blank" rel="noopener noreferrer">View PAE</a>
                            </div>
                        </div>
                    ) : null}
                </div>
                <div className="metadata-section">
                    <h3>Target Protein</h3>
                    {selectedResult ? (
                        <>
                            <p>{selectedResult.object_id}</p>
                            {targetLoading ? (
                                <p>Loading target metadata...</p>
                            ) : targetError ? (
                                <p className="error">{targetError}</p>
                            ) : targetMetadata?.structures[0]?.summary ? (
                                <div className="metrics">
                                    <div className="metric">
                                        <span className="label">UniProt ID:</span>
                                        <span className="value">{targetMetadata.structures[0].summary.uniprotId}</span>
                                    </div>
                                    <div className="metric">
                                        <span className="label">Description:</span>
                                        <span className="value">{targetMetadata.structures[0].summary.uniprotDescription}</span>
                                    </div>
                                    <div className="metric">
                                        <span className="label">Organism:</span>
                                        <span className="value">{targetMetadata.structures[0].summary.organismScientificName}</span>
                                    </div>
                                    <div className="metric">
                                        <span className="label">Length:</span>
                                        <span className="value">{targetMetadata.uniprot_entry.sequence_length}</span>
                                    </div>
                                    <div className="links">
                                        <a href={targetMetadata.structures[0].summary.pdbUrl} target="_blank" rel="noopener noreferrer">Download PDB</a>
                                        {" | "}
                                        <a href={targetMetadata.structures[0].summary.paeImageUrl} target="_blank" rel="noopener noreferrer">View PAE</a>
                                    </div>
                                </div>
                            ) : null}
                        </>
                    ) : (
                        <p className="no-selection">No protein selected</p>
                    )}
                </div>
            </div>
        </div>
    );
} 