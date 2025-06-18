import { useCallback } from 'react';
import { getUniprotData, determineInputType, getPdbToUniprotMapping } from '../../mapping/api';

export function useFoldseek() {
    const getFastaSequence = useCallback(async (inputValue: string) => {
        const inputType = await determineInputType(inputValue);
        let uniprotId = inputValue;
        
        // If it's a PDB ID, get the corresponding UniProt ID first
        if (inputType === 'pdb') {
            const mapping = await getPdbToUniprotMapping(inputValue);
            uniprotId = mapping.uniprotIds[0];
        }
        
        // Get the FASTA sequence
        const uniprotData = await getUniprotData(uniprotId);
        return uniprotData.sequence.value;
    }, []);

    return { getFastaSequence };
} 