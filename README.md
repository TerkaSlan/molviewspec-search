# MolViewSpec Search

A molecular structure viewer application built with React and MolStar.

## Application Structure

This application provides a platform for viewing and interacting with molecular structures. It consists of three main components:

1. **Search Panel** (Left - 20% width): Search functionality for finding molecular structures.
2. **MolStar Viewer** (Center - 60% width): 3D visualization of molecular structures using MolStar.
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
- **Modular Design**: Components are separated for better code organization and maintainability.

## Component Details

### MolstarViewer

The MolstarViewer component initializes and displays molecular structures using the MolStar library. It accepts the following props:

- `width`: Sets the width of the viewer (default: 100%)
- `height`: Sets the height of the viewer (default: 100%)
- `pdbUrl`: URL of the PDB file to display (default: 3PTB.pdb)

### Search

The Search component provides a placeholder for implementing molecular structure search functionality.

### Description

The Description component provides a placeholder for displaying detailed information about the currently viewed molecule.

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
