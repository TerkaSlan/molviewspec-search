import { MetadataResponse, Structure, UniprotEntry } from './types';

const ALPHAFOLD_API_URL = 'https://alphafold.ebi.ac.uk/api';

/**
 * Fetch metadata for a UniProt ID from the AlphaFold API
 * @param uniprotId - The UniProt ID to fetch metadata for
 * @returns A promise that resolves to the metadata response
 */
export async function getMetadata(uniprotId: string): Promise<MetadataResponse> {
    try {
        const url = `${ALPHAFOLD_API_URL}/prediction/${uniprotId}`;
        console.log(`Fetching metadata for UniProt ID: ${uniprotId} from ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Error fetching metadata: HTTP ${response.status}`);
            throw new Error(`Failed to get metadata for UniProt ID ${uniprotId}`);
        }

        const structures = await response.json();
        
        if (!Array.isArray(structures) || structures.length === 0) {
            console.warn(`No metadata found for UniProt ID ${uniprotId}`);
            throw new Error(`No metadata found for UniProt ID ${uniprotId}`);
        }
        
        // Create a unified response format
        const firstStructure = structures[0];
        const uniprot_entry: UniprotEntry = {
            ac: firstStructure.uniprotAccession,
            id: firstStructure.uniprotId,
            uniprot_checksum: firstStructure.sequenceChecksum,
            sequence_length: firstStructure.uniprotSequence.length,
            segment_start: firstStructure.uniprotStart,
            segment_end: firstStructure.uniprotEnd
        };

        const formattedStructures: Structure[] = structures.map(structure => ({
            summary: structure
        }));
        
        const response_data: MetadataResponse = {
            uniprot_entry,
            structures: formattedStructures
        };
        
        console.log(`Successfully fetched metadata for ${uniprotId}`);
        
        return response_data;
    } catch (error) {
        console.error(`Error fetching metadata:`, error);
        throw new Error(`Failed to fetch metadata for UniProt ID ${uniprotId}: ${error instanceof Error ? error.message : String(error)}`);
    }
} 