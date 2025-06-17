import { Story } from '../types';
import { UUID } from 'molstar/lib/mol-util';

interface MolecularVisualizationConfig {
  proteinColor: string;
  ligandColor: string;
  ligandLabel?: string;
  pdbId: string;
}

const createInitialJavaScriptCode = (config: MolecularVisualizationConfig): string => {
  return `// Create a builder for molecular visualization
// Define the structure with full type support
const structure = builder
  .download({url: 'https://www.ebi.ac.uk/pdbe/entry-files/${config.pdbId}.bcif'})
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

export const createTemplateStory = (pdbId: string): Story => ({
  metadata: { title: `Structure ${pdbId.toUpperCase()}` },
  javascript: '// Common code for all scenes\n',
  scenes: [
    {
      id: UUID.createv4(),
      header: 'Default View',
      key: 'scene_01',
      description:
        `# ${pdbId.toUpperCase()} Structure\n\nShowing the protein structure in cartoon representation with ligands in ball-and-stick representation.`,
      javascript: createInitialJavaScriptCode({
        proteinColor: 'green',
        ligandColor: '#cc3399',
        ligandLabel: 'Ligand',
        pdbId: pdbId.toLowerCase()
      }),
    },
    {
      id: UUID.createv4(),
      header: 'Alternative View',
      key: 'scene_02',
      description: `# ${pdbId.toUpperCase()} Alternative View\n\nAlternative coloring scheme for better visualization.`,
      javascript: createInitialJavaScriptCode({
        proteinColor: 'blue',
        ligandColor: 'orange',
        ligandLabel: 'Ligand',
        pdbId: pdbId.toLowerCase()
      }),
    },
  ],
  assets: [],
});

// Keep the SimpleStory as a demo/example
export const SimpleStory: Story = createTemplateStory('1cbs');
