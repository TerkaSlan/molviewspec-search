import React, { useMemo, useEffect } from 'react';
import { SearchModel } from '../search/models/SearchModel';
import { MVSModel } from '../mvs/models/MVSModel';
import { useObservable } from '../../lib/hooks/use-observable';
import { Metadata } from './ui/Metadata';
import { MetadataModel } from './models/MetadataModel';

interface MetadataContainerProps {
    searchModel: SearchModel;
    mvsModel: MVSModel;
}

export function MetadataContainer({ searchModel, mvsModel }: MetadataContainerProps) {
    // Create metadata model instances for query and target
    const queryMetadataModel = useMemo(() => new MetadataModel(), []);
    const targetMetadataModel = useMemo(() => new MetadataModel(), []);

    // Get state from search model
    const query = useObservable(searchModel.selectors.input.query(), null);
    const selectedResult = useObservable(searchModel.selectors.results.selectedResult(), null);
    const pdbMapping = useObservable(searchModel.selectors.input.pdbMapping(), null);
    const { isSearching } = useObservable(searchModel.selectors.search.status(), { isSearching: false, validationError: null });
    const inputType = useObservable(searchModel.selectors.input.inputType(), null) as 'pdb' | 'uniprot' | 'invalid' | null;

    // Effect to manage query metadata fetching
    useEffect(() => {
        // Only proceed if we have a query and it's not in a searching state
        if (!query || isSearching || inputType === 'invalid') {
            queryMetadataModel.clearMetadata();
            return;
        }

        // Get the appropriate ID and type
        const queryId = pdbMapping?.uniprotId || query;
        const effectiveInputType = pdbMapping?.uniprotId ? 'uniprot' : inputType;
        
        if (queryId) {
            queryMetadataModel.fetchMetadata(queryId, effectiveInputType);
        } else {
            queryMetadataModel.clearMetadata();
        }
    }, [query, pdbMapping, inputType, isSearching, queryMetadataModel]);

    // Effect to manage target metadata fetching
    useEffect(() => {
        if (!selectedResult || isSearching) {
            targetMetadataModel.clearMetadata();
            return;
        }

        // Extract UniProt ID from the target object_id
        const targetUniprotId = selectedResult.object_id;
        
        if (targetUniprotId) {
            targetMetadataModel.fetchMetadata(targetUniprotId, 'uniprot');
        } else {
            targetMetadataModel.clearMetadata();
        }
    }, [selectedResult, isSearching, targetMetadataModel]);

    // Don't render anything if there's no valid search
    if (!query || inputType === 'invalid') {
        return null;
    }

    return (
        <Metadata
            queryProteinId={pdbMapping?.uniprotId || query || ''}
            selectedResult={selectedResult}
            queryModel={queryMetadataModel}
            targetModel={targetMetadataModel}
        />
    );
} 