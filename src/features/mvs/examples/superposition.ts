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

  // Log the visualization code to console
  console.log('Visualization Code:', code);
  console.log('Configuration:', config);

  return code;
};

export const createSuperpositionTemplateStory = (queryProteinId: string, superpositionData: SuperpositionData): Story => ({
  metadata: { title: `Structure ${queryProteinId.toUpperCase()}` },
  javascript: '// Common code for all scenes\n',
  scenes: [
    {
      id: UUID.createv4(),
      header: 'Default View',
      key: 'scene_01',
      description:
        `Superposition of **${queryProteinId.toUpperCase()}** and **${superpositionData.object_id.toUpperCase()}**.\n\nAlignment metrics:\n- RMSD: ${superpositionData.rmsd.toFixed(2)}\n- TM-score: ${superpositionData.tm_score.toFixed(4)}\n- Aligned: ${(superpositionData.aligned_percentage * 100).toFixed(1)}%`,
      javascript: createInitialJavaScriptCode({
        queryProteinColor: 'green',
        targetProteinColor: 'blue',
        ligandColor: '#cc3399',
        ligandLabel: 'Ligand',
        queryProteinId: queryProteinId,
        targetProteinId: superpositionData.object_id,
        rotation_matrix: superpositionData.rotation_matrix,
        translation_vector: superpositionData.translation_vector
      }),
    }
  ],
  assets: [],
});

// Keep the SimpleStory as a demo/example
export const SimpleStory: Story = createSuperpositionTemplateStory('Q9FFD0', {
  object_id: 'V4KUL2',
  aligned_percentage: 0.96600566572238,
  rmsd: 0,
  rotation_matrix: [
    [0.426647081, -0.8306958628, -0.3576543747],
    [0.6321548112, -0.0089086134, 0.7747908952],
    [-0.6468017958, -0.5566552075, 0.5213275524]
  ],
  translation_vector: [-0.024638318, -0.0226368405, -1.659659342],
  sequence_aligned_percentage: 0.634665722379603,
  tm_score: 0.9661,
  tm_score_target: 0.958
});
