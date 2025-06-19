import { Story } from '../../types';
import { UUID } from 'molstar/lib/mol-util';
import { SuperpositionData } from '../../search/types';

interface SuperpositionMolecularVisualizationConfig {
  queryProteinColor: string;
  ligandColor: string;
  ligandLabel?: string;
  queryProteinId: string;
  targetProteinId: string;
  targetProteinColor: string;
  rotation_matrix?: number[][];
  translation_vector?: number[];
}

const createInitialJavaScriptCode = (config: SuperpositionMolecularVisualizationConfig): string => {
  const transposeAndFlatten = (matrix: number[][]): number[] => {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex])).flat();
  };

  const transformCode = config.rotation_matrix && config.translation_vector ? `
  .transform({
    rotation: [${config.rotation_matrix ? transposeAndFlatten(config.rotation_matrix).join(', ') : ''}],
    translation: [${config.translation_vector.join(', ')}]
  })` : '';

  const code = `// Create a builder for molecular visualization
// Define the query structure
const queryStructure = builder
  .download({url: 'https://alphafold.ebi.ac.uk/files/AF-${config.queryProteinId}-F1-model_v4.bcif'})
  .parse({ format: 'bcif' })
  .modelStructure({})

// Add components and representations for query protein
queryStructure
  .component({ selector: 'polymer' })
  .representation({ type: 'cartoon' })
  .color({ color: '${config.queryProteinColor}' });

// Add target protein
const targetStructure = builder
  .download({url: 'https://alphafold.ebi.ac.uk/files/AF-${config.targetProteinId}-F1-model_v4.bcif'})
  .parse({ format: 'bcif' })
  .modelStructure({})${transformCode};

// Add components and representations for target protein
targetStructure
  .component({ selector: 'polymer' })
  .representation({ type: 'cartoon' })
  .color({ color: '${config.targetProteinColor}' });
`;

  return code;
};

export const createMultiSceneStory = (queryProteinId: string, results: SuperpositionData[]): Story => ({
  metadata: { title: `Structure ${queryProteinId.toUpperCase()} - Multiple Alignments` },
  javascript: '// Common code for all scenes\n',
  scenes: results.map((result, index) => ({
    id: UUID.createv4(),
    header: `Alignment ${index + 1}`,
    key: `scene_${result.object_id}`,
    description:
      `Superposition of **${queryProteinId.toUpperCase()}** and **${result.object_id.toUpperCase()}**.\n\nAlignment metrics:\n- RMSD: ${result.rmsd.toFixed(2)}\n- TM-score: ${result.tm_score.toFixed(4)}\n- Aligned: ${(result.aligned_percentage * 100).toFixed(1)}%`,
    javascript: createInitialJavaScriptCode({
      queryProteinColor: 'green',
      targetProteinColor: 'blue',
      ligandColor: '#cc3399',
      ligandLabel: 'Ligand',
      queryProteinId: queryProteinId,
      targetProteinId: result.object_id,
      rotation_matrix: result.rotation_matrix,
      translation_vector: result.translation_vector
    }),
  })),
  assets: [],
});
