// Re-export the MVS functionality from Molstar extensions
import { MVSData } from 'molstar/lib/extensions/mvs/mvs-data';
import { loadMVS } from 'molstar/lib/extensions/mvs/load';
import type { MVSData_States } from 'molstar/lib/extensions/mvs/mvs-data';

/**
 * Gets the appropriate structure format based on file URL
 */
export function getStructureFormat(url: string): 'mmcif' | 'pdb' | 'map' | 'bcif' {
  const ext = url.split('.').pop()?.toLowerCase();
  
  if (!ext) return 'mmcif';
  
  switch (ext) {
    case 'pdb': return 'pdb';
    case 'cif': 
    case 'mmcif': return 'mmcif';
    case 'bcif': return 'bcif';
    case 'map': return 'map';
    default: return 'mmcif';
  }
}

/**
 * Options for configuring the MVS creation
 */
export interface MVSOptions {
  title?: string;
  description?: string;
}

/**
 * Creates a basic MVS view with standard representations
 */
export function createBasicMVS(pdbId: string, options: MVSOptions = {}): MVSData_States {
  // Create an MVS builder using the MVSData utility
  const builder = MVSData.createBuilder();
  
  // Build the MVS tree
  const structure = builder
    .download({ url: `https://files.rcsb.org/download/${pdbId}.cif` })
    .parse({ format: 'mmcif' })
    .modelStructure({ model_index: 0 });
  
  structure
    .component({ selector: 'polymer' })
    .representation({ type: 'cartoon' });
  
  structure
    .component({ selector: 'ligand' })
    .representation({ type: 'ball_and_stick' });
  
  // Create the MVS data with a single snapshot
  return {
    kind: 'multiple',
    snapshots: [
      builder.getSnapshot({
        title: options.title || `Structure ${pdbId}`,
        description: options.description || `Visualization of ${pdbId}`,
        linger_duration_ms: 0 // Keep this snapshot (don't auto-advance)
      })
    ],
    metadata: {
      title: options.title || `Structure ${pdbId}`,
      description: options.description || `Visualization of ${pdbId}`,
      version: '1.0',
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Creates an MVS with multiple views of the same structure
 */
export function createExplainedMVS(pdbId: string, options: MVSOptions = {}): MVSData_States {
  // Create an MVS builder
  const builder = MVSData.createBuilder();
  
  // First view: Complete structure
  const structure1 = builder
    .download({ url: `https://files.rcsb.org/download/${pdbId}.cif` })
    .parse({ format: 'mmcif' })
    .modelStructure({ model_index: 0 });
  
  structure1
    .component({ selector: 'polymer' })
    .representation({ type: 'cartoon' });
  
  structure1
    .component({ selector: 'ligand' })
    .representation({ type: 'ball_and_stick' });
  
  // Create snapshot for the first view
  const snapshot1 = builder.getSnapshot({
    title: 'Complete Structure',
    description: 'Complete structure showing protein and ligands',
    linger_duration_ms: 3000
  });

  // Second view: Cartoon only
  // Create a new builder for the second view to avoid state issues
  const builder2 = MVSData.createBuilder();
  
  const structure2 = builder2
    .download({ url: `https://files.rcsb.org/download/${pdbId}.cif` })
    .parse({ format: 'mmcif' })
    .modelStructure({ model_index: 0 });
  
  structure2
    .component({ selector: 'polymer' })
    .representation({ type: 'cartoon' });
  
  // Create snapshot for the second view
  const snapshot2 = builder2.getSnapshot({
    title: 'Cartoon View',
    description: 'Cartoon representation of protein structure',
    linger_duration_ms: 3000
  });

  // Third view: Surface
  // Create a new builder for the third view to avoid state issues
  const builder3 = MVSData.createBuilder();
  
  const structure3 = builder3
    .download({ url: `https://files.rcsb.org/download/${pdbId}.cif` })
    .parse({ format: 'mmcif' })
    .modelStructure({ model_index: 0 });
  
  structure3
    .component({ selector: 'polymer' })
    .representation({ type: 'surface' });
  
  structure3
    .component({ selector: 'ligand' })
    .representation({ type: 'ball_and_stick' });
  
  // Create snapshot for the third view
  const snapshot3 = builder3.getSnapshot({
    title: 'Surface View',
    description: 'Surface representation with ligands',
    linger_duration_ms: 0 // Keep this snapshot (don't auto-advance)
  });
  
  // Create the MVS data with multiple snapshots
  return {
    kind: 'multiple',
    snapshots: [snapshot1, snapshot2, snapshot3],
    metadata: {
      title: options.title || `Explained Structure ${pdbId}`,
      description: options.description || `Interactive visualization of ${pdbId} with multiple views`,
      version: '1.0',
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Creates an MVS for comparing two structures
 */
export function createComparisonMVS(
  queryUrl: string, 
  queryId: string,
  targetUrl: string, 
  targetId: string,
  superpositionInfo?: string
): MVSData_States {
  // Create an MVS builder
  const builder = MVSData.createBuilder();
  
  // Convert formats or use mmcif as default
  const queryFormat = getStructureFormat(queryUrl);
  const targetFormat = getStructureFormat(targetUrl);
  
  // Add the query structure with blue color
  const queryStructure = builder
    .download({ url: queryUrl })
    .parse({ format: queryFormat })
    .modelStructure({ model_index: 0 });
  
  queryStructure
    .component({ selector: 'polymer' })
    .representation({ type: 'cartoon' })
    .color({ color: 'blue' });
  
  // Add the target structure with a different color
  const targetStructure = builder
    .download({ url: targetUrl })
    .parse({ format: targetFormat })
    .modelStructure({ model_index: 0 });
  
  targetStructure
    .component({ selector: 'polymer' })
    .representation({ type: 'cartoon' })
    .color({ color: 'green' });
  
  const title = `${queryId} vs ${targetId}`;
  
  // Create the MVS data with a single snapshot
  return {
    kind: 'multiple',
    snapshots: [
      builder.getSnapshot({
        title: title,
        description: `Query: ${queryId} | Target: ${targetId}\n\n${superpositionInfo || ''}`,
        linger_duration_ms: 0 // Keep this snapshot (don't auto-advance)
      })
    ],
    metadata: {
      title: 'Structure Comparison',
      version: '1.0',
      timestamp: new Date().toISOString()
    }
  };
}

// Function to create an MVS builder
export function createMVSBuilder() {
  return MVSData.createBuilder();
}

// Re-export the loadMVS function
export { loadMVS };
export type { MVSData_States };

export default {
  createMVSBuilder,
  createBasicMVS,
  createExplainedMVS,
  createComparisonMVS,
  getStructureFormat,
  loadMVS
}; 