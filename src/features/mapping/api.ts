const PDBE_API_URL = 'https://www.ebi.ac.uk/pdbe/api/mappings/uniprot';

export interface PDBToUniProtMapping {
    uniprotIds: string[];
    originalPdbId: string;
}

/**
 * Convert PDB ID to UniProt ID(s) using the PDBe API
 * @param pdbId - The PDB ID to convert (e.g., "1cbs")
 * @returns A promise that resolves to an object containing UniProt IDs and the original PDB ID
 */
export async function getPdbToUniprotMapping(pdbId: string): Promise<PDBToUniProtMapping> {
    try {
        const url = `${PDBE_API_URL}/${pdbId.toLowerCase()}`;
        console.log(`Fetching UniProt mapping for PDB ID: ${pdbId} from ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Error fetching UniProt mapping: HTTP ${response.status}`);
            throw new Error(`Failed to get UniProt mapping for PDB ID ${pdbId}`);
        }

        const data = await response.json();
        
        // PDBe API returns data in format: { pdbId: { UniProt: { uniprotId: [{ ... }] } } }
        if (!data[pdbId.toLowerCase()] || !data[pdbId.toLowerCase()].UniProt) {
            console.warn(`No UniProt mapping found for PDB ID ${pdbId}`);
            throw new Error(`No UniProt mapping found for PDB ID ${pdbId}`);
        }
        
        // Extract UniProt IDs from the response
        const uniprotIds = Object.keys(data[pdbId.toLowerCase()].UniProt);
        
        if (uniprotIds.length === 0) {
            console.warn(`No UniProt IDs found for PDB ID ${pdbId}`);
            throw new Error(`No UniProt IDs found for PDB ID ${pdbId}`);
        }
        
        console.log(`Found UniProt IDs for ${pdbId}:`, uniprotIds);
        
        return {
            uniprotIds,
            originalPdbId: pdbId
        };
    } catch (error) {
        console.error(`Error mapping PDB ID to UniProt:`, error);
        throw new Error(`Failed to map PDB ID ${pdbId} to UniProt ID: ${error instanceof Error ? error.message : String(error)}`);
    }
} 