# Mol* MolViewSpec Demo

This is a React application that demonstrates the use of [Mol*](https://molstar.org/) and MolViewSpec to visualize molecular structures.

## Features

- Load pre-defined MolViewSpec (MVS) files from URLs
- Build custom MVS programmatically
- Display 3D molecular structures with different representations
- Toggle between different views

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

The demo includes two main functions:

1. **Load Pre-defined MVS**: Loads a pre-defined MVS file (1cbs.mvsj) from GitHub and displays it
2. **Build Custom MVS**: Builds a custom MVS programmatically for structure 1og2 with different representations for polymer and ligand components

Click the buttons to switch between these two views. Check the browser console to see the MVS data.

## How It Works

The demo implements the following functionality:

```typescript
// Fetch a MVS, validate, and load
const response = await fetch('https://raw.githubusercontent.com/molstar/molstar/master/examples/mvs/1cbs.mvsj');
const rawData = await response.text();
const mvsData: MVSData = MVSData.fromMVSJ(rawData);
if (!MVSData.isValid(mvsData)) throw new Error(`Oh no: ${MVSData.validationIssues(mvsData)}`);
await loadMVS(plugin, mvsData, { replaceExisting: true });
console.log('Loaded this:', MVSData.toPrettyString(mvsData));
console.log('Loaded this:', MVSData.toMVSJ(mvsData));

// Build a MVS and load
const builder = MVSData.createBuilder();
const structure = builder.download({ url: 'https://www.ebi.ac.uk/pdbe/entry-files/download/1og2_updated.cif' }).parse({ format: 'mmcif' }).modelStructure();
structure.component({ selector: 'polymer' }).representation({ type: 'cartoon' });
structure.component({ selector: 'ligand' }).representation({ type: 'ball_and_stick' }).color({ color: '#aa55ff' });
const mvsData2: MVSData = builder.getState();
await loadMVS(plugin, mvsData2, { replaceExisting: false });
```

## Technologies Used

- React
- TypeScript
- Mol* molecular visualization library
- Styled Components

## Learn More

- [Mol* Documentation](https://molstar.org/)
- [MolViewSpec Documentation](https://molstar.org/mol-view-spec-docs/mvs-molstar-extension/) 