import { Story } from '../../types';
import { UUID } from 'molstar/lib/mol-util';

interface SuperpositionMolecularVisualizationConfig {
  queryProteinColor: string;
  ligandColor: string;
  ligandLabel?: string;
  queryProteinId: string;
  targetProteinId: string;
  targetProteinColor: string;
}

const createInitialJavaScriptCode = (config: SuperpositionMolecularVisualizationConfig): string => {
  return `// Create a builder for molecular visualization
// Define the query structure
const queryStructure = builder
  .download({url: 'https://alphafold.ebi.ac.uk/files/AF-${config.queryProteinId}-F1-model_v4.bcif'})
  .parse({ format: 'bcif' })
  .modelStructure({});

// Add components and representations for query protein
queryStructure
  .component({ selector: 'polymer' })
  .representation({ type: 'cartoon' })
  .color({ color: '${config.queryProteinColor}' });

// Add target protein
const targetStructure = builder
  .download({url: 'https://alphafold.ebi.ac.uk/files/AF-${config.targetProteinId}-F1-model_v4.bcif'})
  .parse({ format: 'bcif' })
  .modelStructure({})
  .transform({
    rotation: [-0.7202161, -0.33009904, -0.61018308, 0.36257631, 0.57075962, -0.73673053, 0.59146191, -0.75184312, -0.29138417],
    translation: [0, 0, 0]
  });

// Add components and representations for target protein
targetStructure
  .component({ selector: 'polymer' })
  .representation({ type: 'cartoon' })
  .color({ color: '${config.targetProteinColor}' });

`;
};

export const createSuperpositionTemplateStory = (queryProteinId: string, targetProteinId: string): Story => ({
  metadata: { title: `Structure ${queryProteinId.toUpperCase()}` },
  javascript: '// Common code for all scenes\n',
  scenes: [
    {
      id: UUID.createv4(),
      header: 'Default View',
      key: 'scene_01',
      description:
        `# ${queryProteinId.toUpperCase()} Structure\n\nShowing the protein structure in cartoon representation with ligands in ball-and-stick representation.`,
      javascript: createInitialJavaScriptCode({
        queryProteinColor: 'green',
        targetProteinColor: 'blue',
        ligandColor: '#cc3399',
        ligandLabel: 'Ligand',
        queryProteinId: queryProteinId,
        targetProteinId: targetProteinId
      }),
    }
  ],
  assets: [],
});

// Keep the SimpleStory as a demo/example
export const SimpleStory: Story = createSuperpositionTemplateStory('Q8N9T8', 'P31323');
