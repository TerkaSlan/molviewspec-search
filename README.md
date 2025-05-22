# Mol* MolViewSpec Search Demo

[![DOI](https://zenodo.org/badge/983983402.svg)](https://doi.org/10.5281/zenodo.15489496)
[![Node.js CI](https://github.com/TerkaSlan/molviewspec-search/actions/workflows/test.yaml/badge.svg)](https://github.com/TerkaSlan/molviewspec-search/actions/workflows/test.yaml)

This React application demonstrates programmatic creation of [MolViewSpec (MVS)](https://molstar.org/mol-view-spec-docs/mvs-molstar-extension/) files for molecular visualization with [Mol*](https://molstar.org/).

## Features

- Search for molecular structures by PDB ID
- **Programmatically create MVS** based on the search query
- Pass the generated MVS to Mol* for advanced molecular visualization
- Display MVS metadata and structure description in the description panel
- Interactive 3D visualization with multiple representation styles

## Getting Started

### Prerequisites

- Node.js (v14 or later recommended)
- npm (usually comes with Node.js)

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

## Usage

Enter a PDB ID in the search box to:
1. Create a custom MVS programmatically for the requested structure
2. Visualize the 3D structure with Mol* viewer
3. View structure description in the right panel

## How It Works

When you search for a PDB ID, the application:

```typescript
// Build the MVS programmatically
const builder = MVSData.createBuilder();
const structure = builder
  .download({ url: `https://www.ebi.ac.uk/pdbe/entry-files/download/${pdbId}_updated.cif` })
  .parse({ format: 'mmcif' })
  .modelStructure();

structure
  .component({ selector: 'polymer' })
  .representation({ type: 'cartoon' });

structure
  .component({ selector: 'ligand' })
  .representation({ type: 'ball_and_stick' });

// Create snapshot with metadata using the builder directly
const snapshot = builder.getSnapshot({
  title: `${pdbId.toUpperCase()} Structure Visualization`,
  description: `### PDB Structure ${pdbId.toUpperCase()}
  - Cartoon representation of protein
  - Ball and stick representation of ligands`,
  timestamp: new Date().toISOString()
});

// Load the MVS with metadata
await loadMVS(plugin, snapshot, { replaceExisting: true });
```

The metadata from the MVS is then displayed in the description panel, providing context for the visualization.

## Technologies Used

- React
- TypeScript
- Mol* molecular visualization library
- MolViewSpec for structured visualization state management
- ReactMarkdown for rendering descriptions

## Learn More

- [Mol* Documentation](https://molstar.org/)
- [MolViewSpec Documentation](https://molstar.org/mol-view-spec-docs/mvs-molstar-extension/) 
