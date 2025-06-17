import { useState } from 'react';
import { getPdbToUniprotMapping, PDBToUniProtMapping } from '../api';

interface UseMappingResult {
    mapping: PDBToUniProtMapping | null;
    isLoading: boolean;
    error: string | null;
    getMapping: (pdbId: string) => Promise<void>;
}

export function useMapping(): UseMappingResult {
    const [mapping, setMapping] = useState<PDBToUniProtMapping | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getMapping = async (pdbId: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await getPdbToUniprotMapping(pdbId);
            setMapping(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setMapping(null);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        mapping,
        isLoading,
        error,
        getMapping
    };
} 