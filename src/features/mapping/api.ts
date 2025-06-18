const PDBE_API_URL = 'https://www.ebi.ac.uk/pdbe/api/mappings/uniprot';
const UNIPROT_API_URL = 'https://rest.uniprot.org/uniprotkb';
const RCSB_API_URL = 'https://data.rcsb.org/rest/v1/core/entry';

export interface PDBToUniProtMapping {
    uniprotIds: string[];
    originalPdbId: string;
}

export interface UniProtResponse {
    sequence: {
        value: string;
    };
}

export type InputType = 'pdb' | 'uniprot' | 'invalid';

/**
 * Validate if an input is a valid PDB ID
 */
export async function validatePdbId(id: string): Promise<boolean> {
    try {
        const url = `${RCSB_API_URL}/${id.toLowerCase()}`;
        console.log(`Validating PDB ID: ${id} at ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        return response.ok;
    } catch (error) {
        console.error(`Error validating PDB ID:`, error);
        return false;
    }
}

/**
 * Validate if an input is a valid UniProt ID
 */
export async function validateUniprotId(id: string): Promise<boolean> {
    try {
        const url = `${UNIPROT_API_URL}/${id}`;
        console.log(`Validating UniProt ID: ${id} at ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        return response.ok;
    } catch (error) {
        console.error(`Error validating UniProt ID:`, error);
        return false;
    }
}

/**
 * Determine the type of input (PDB ID or UniProt ID)
 */
export async function determineInputType(input: string): Promise<InputType> {
    if (!input.trim()) return 'invalid';
    
    // First try PDB ID validation as it's more likely in our context
    if (await validatePdbId(input)) {
        return 'pdb';
    }
    
    // Then try UniProt ID validation
    if (await validateUniprotId(input)) {
        return 'uniprot';
    }
    
    return 'invalid';
}

/**
 * Fetch sequence data from UniProt API
 * @param uniprotId - The UniProt ID to fetch data for
 * @returns A promise that resolves to the sequence data
 */
export async function getUniprotData(uniprotId: string): Promise<UniProtResponse> {
    try {
        const url = `${UNIPROT_API_URL}/${uniprotId}`;
        console.log(`Fetching UniProt data for ID: ${uniprotId} from ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Error fetching UniProt data: HTTP ${response.status}`);
            throw new Error(`Failed to get UniProt data for ID ${uniprotId}`);
        }

        const data = await response.json();
        
        if (!data.sequence?.value) {
            console.warn(`No sequence found for UniProt ID ${uniprotId}`);
            throw new Error(`No sequence found for UniProt ID ${uniprotId}`);
        }
        
        console.log(`Successfully fetched UniProt data for ${uniprotId}`);
        
        return data;
    } catch (error) {
        console.error(`Error fetching UniProt data:`, error);
        throw new Error(`Failed to fetch UniProt data for ID ${uniprotId}: ${error instanceof Error ? error.message : String(error)}`);
    }
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

/**
 * Fetch FASTA sequence for a UniProt ID
 * @param uniprotId - The UniProt ID to fetch FASTA for
 * @returns A promise that resolves to the FASTA sequence as a string
 */
export async function getFastaFromUniprot(uniprotId: string): Promise<string> {
    try {
        const url = `${UNIPROT_API_URL}/${uniprotId}.fasta`;
        console.log(`Fetching FASTA for UniProt ID: ${uniprotId} from ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'text/plain'
            }
        });

        if (!response.ok) {
            console.error(`Error fetching FASTA: HTTP ${response.status}`);
            throw new Error(`Failed to get FASTA for UniProt ID ${uniprotId}`);
        }

        const fasta = await response.text();
        
        if (!fasta) {
            console.warn(`No FASTA found for UniProt ID ${uniprotId}`);
            throw new Error(`No FASTA found for UniProt ID ${uniprotId}`);
        }
        
        console.log(`Successfully fetched FASTA for ${uniprotId}`);
        
        return fasta;
    } catch (error) {
        console.error(`Error fetching FASTA from UniProt:`, error);
        throw new Error(`Failed to fetch FASTA for UniProt ID ${uniprotId}: ${error instanceof Error ? error.message : String(error)}`);
    }
} 