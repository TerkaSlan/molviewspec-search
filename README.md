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

## Technologies Used

- React
- TypeScript
- Mol* molecular visualization library
- MolViewSpec for structured visualization state management
- ReactMarkdown for rendering descriptions

## Learn More

- [Mol* Documentation](https://molstar.org/)
- [MolViewSpec Documentation](https://molstar.org/mol-view-spec-docs/mvs-molstar-extension/) 
