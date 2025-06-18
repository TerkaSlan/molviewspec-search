import { Story } from '../../types';
import { UUID } from 'molstar/lib/mol-util';

interface MolecularVisualizationConfig {
  proteinColor: string;
  ligandColor: string;
  ligandLabel?: string;
  proteinId: string;
}

const createInitialJavaScriptCode = (config: MolecularVisualizationConfig): string => {
  return `// Create a builder for molecular visualization
// Define the structure with full type support
const structure = builder
  .download({url: 'https://alphafold.ebi.ac.uk/files/AF-${config.proteinId}-F1-model_v4.bcif'})
  .parse({ format: 'bcif' })
  .modelStructure({});

// Add components and representations
structure
  .component({ selector: 'polymer' })
  .representation({ type: 'cartoon' })
  .color({ color: '${config.proteinColor}' });

// Add ligand
structure
  .component({ selector: 'ligand' })
  .representation({ type: 'ball_and_stick' })
  .color({ color: '${config.ligandColor}' });
`;
};

export const createTemplateStory = (proteinId: string): Story => ({
  metadata: { title: `Structure ${proteinId.toUpperCase()}` },
  javascript: '// Common code for all scenes\n',
  scenes: [
    {
      id: UUID.createv4(),
      header: 'Default View',
      key: 'scene_01',
      description:
        `# ${proteinId.toUpperCase()} Structure\n\nShowing the protein structure in cartoon representation with ligands in ball-and-stick representation.`,
      javascript: createInitialJavaScriptCode({
        proteinColor: 'green',
        ligandColor: '#cc3399',
        ligandLabel: 'Ligand',
        proteinId: proteinId
      }),
    },
    {
      id: UUID.createv4(),
      header: 'Alternative View',
      key: 'scene_02',
      description: `# ${proteinId.toUpperCase()} Alternative View\n\nAlternative coloring scheme for better visualization.`,
      javascript: createInitialJavaScriptCode({
        proteinColor: 'blue',
        ligandColor: 'orange',
        ligandLabel: 'Ligand',
        proteinId: proteinId
      }),
    },
  ],
  assets: [],
});

// Keep the SimpleStory as a demo/example
export const SimpleStory: Story = createTemplateStory('Q9FFD0');
