export interface UniprotEntry {
    ac: string;
    id: string;
    uniprot_checksum: string;
    sequence_length: number;
    segment_start: number;
    segment_end: number;
}

export interface StructureEntity {
    entity_type: string;
    entity_poly_type: string;
    identifier: string;
    identifier_category: string;
    description: string;
    chain_ids: string[];
}

export interface StructureSummary {
    entryId: string;
    gene: string;
    sequenceChecksum: string;
    sequenceVersionDate: string;
    uniprotAccession: string;
    uniprotId: string;
    uniprotDescription: string;
    taxId: number;
    organismScientificName: string;
    uniprotStart: number;
    uniprotEnd: number;
    uniprotSequence: string;
    modelCreatedDate: string;
    latestVersion: number;
    allVersions: number[];
    bcifUrl: string;
    cifUrl: string;
    pdbUrl: string;
    paeImageUrl: string;
    paeDocUrl: string;
    amAnnotationsUrl: string | null;
    amAnnotationsHg19Url: string | null;
    amAnnotationsHg38Url: string | null;
    isReviewed: boolean;
    isReferenceProteome: boolean;
}

export interface Structure {
    summary: StructureSummary;
}

export interface MetadataResponse {
    uniprot_entry: UniprotEntry;
    structures: Structure[];
}

export interface MetadataState {
    data: MetadataResponse | null;
    isLoading: boolean;
    error: string | null;
} 