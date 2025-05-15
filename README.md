# MolViewSpec Search

A molecular structure viewer application built with React, MolStar, and MolViewSpec.

## Application Structure

This application provides a platform for viewing and interacting with molecular structures. It consists of three main components:

1. **Search Panel** (Left - 20% width): Search functionality for finding molecular structures.
2. **MolStar Viewer** (Center - 60% width): 3D visualization of molecular structures using MolStar with MolViewSpec.
3. **Description Panel** (Right - 20% width): Information and details about the selected molecule.

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

```bash
npm install
```

### Running the Application

```bash
npm start
```

This runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Features

- **Responsive Layout**: The application uses a flexible layout to ensure proper display across screen sizes.
- **MolStar Integration**: Provides powerful molecular visualization capabilities.
- **MolViewSpec Support**: Uses MolViewSpec for declarative molecular visualization specification.
- **Dual Loading Modes**: Support for both MolViewSpec-based loading and direct PDB loading.
- **PDB Structure Search**: Search for common PDB structures or enter a custom PDB ID.
- **Structure Details**: View comprehensive information about the loaded structure.

## Component Details

### MolstarViewer

The MolstarViewer component initializes and displays molecular structures using the MolStar library. It accepts the following props:

- `width`: Sets the width of the viewer (default: 100%)
- `height`: Sets the height of the viewer (default: 100%)
- `pdbUrl`: URL of the PDB file to display (optional)
- `mvsData`: MolViewSpec data for advanced visualization (optional)
- `options`: Configuration options for the viewer

### Search

The Search component provides functionality for finding and selecting molecular structures:

- Displays a list of common structures
- Allows filtering by PDB ID or structure name
- Enables direct PDB ID input

### Description

The Description component displays detailed information about the currently viewed molecule:

- Fetches and displays metadata from the RCSB PDB API
- Shows title, authors, resolution, experimental method, and more
- Provides links to external resources

## MolViewSpec Integration

This application uses MolViewSpec for declarative specification of molecular visualizations:

- **MVSBuilder**: Utility for creating MolViewSpec data objects
- **Structure Representation**: Define representations for polymers, ligands, etc.
- **PDB ID-based Loading**: Automatically fetch structures from the PDB

## Available Scripts

In the project directory, you can also run:

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.

## Learn More

To learn more about React, check out the [React documentation](https://reactjs.org/).

For information about MolStar, visit the [MolStar GitHub repository](https://github.com/molstar/molstar).

For information about MolViewSpec, visit the [MolViewSpec examples](https://github.com/molstar/molstar/tree/master/src/examples/mvs-stories).
