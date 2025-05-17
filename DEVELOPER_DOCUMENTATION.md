# MolViewSpec Search Demo - Developer Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Component Structure](#component-structure)
3. [Data Flow](#data-flow)
4. [State Management](#state-management)
5. [Key Components](#key-components)
6. [Code Documentation](#code-documentation)
7. [Extending the Application](#extending-the-application)
8. [Examples](#examples)

## Architecture Overview

This application demonstrates programmatic creation of MolViewSpec (MVS) files for molecular visualization with Mol*. It follows a modular, component-based architecture with:

- **React** as the UI framework
- **RxJS** for reactive state management
- **Context API** for dependency injection
- **Mol*** for molecular visualization
- **MolViewSpec** for structured visualization state

The architecture follows these design principles:
- **Separation of Concerns**: Clear boundaries between visualization, data handling, and UI components
- **Reactive Patterns**: Observable-based state management for reactive data flow
- **Declarative UI**: React components declare what to render based on application state
- **Extensibility**: Components designed for easy extension and modification

## Component Structure

```
src/
├── components/                 # UI Components
│   ├── DescriptionPanel.tsx    # Displays structure description and metadata
│   ├── MolstarViewer.tsx       # Handles 3D visualization with Mol*
│   └── SearchInput.tsx         # Search interface for PDB structures
├── App.tsx                     # Main application component
├── index.tsx                   # Application entry point
├── model.tsx                   # Data model and state management
└── styles.css                  # Application styles
```

## Data Flow

The application follows a unidirectional data flow:

1. **User Input** → User enters a PDB ID in the search box
2. **Model Update** → The model updates the search query state and fetches structure data
3. **MVS Generation** → The MolstarViewer programmatically generates MVS based on the search query
4. **Visualization** → The generated MVS is passed to Mol* for 3D visualization
5. **UI Update** → The DescriptionPanel displays MVS metadata and structure description

![Data Flow Diagram]
```
SearchInput → Model → MolstarViewer → Mol* Viewer
                ↓                       ↓
                └───→ DescriptionPanel ←┘
```

## State Management

The application uses RxJS BehaviorSubjects for reactive state management through the `MolViewSpecModel` class:

```typescript
state = {
  // Current search query
  searchQuery: new BehaviorSubject<string>(''),
  
  // Current search result
  currentResult: new BehaviorSubject<SearchResult | null>(null),
  
  // Loading state
  isLoading: new BehaviorSubject<boolean>(false),
  
  // Error state
  error: new BehaviorSubject<string | null>(null),
  
  // MVS Description from the viewer
  mvsDescription: new BehaviorSubject<string | null>(null),
  
  // Current MVS snapshot for download
  currentMVS: new BehaviorSubject<any>(null)
};
```

Components subscribe to these observables using the `useBehavior` hook to react to state changes.

## Key Components

### ModelProvider (`model.tsx`)

The `ModelProvider` serves as the central data management layer:

- Provides application state through React Context
- Manages search queries and results
- Handles loading and error states
- Maintains MVS data and structure information

### MolstarViewer (`components/MolstarViewer.tsx`)

The visualization component that:

- Initializes and manages the Mol* viewer
- Programmatically builds MVS based on search queries
- Creates structured snapshots with metadata
- Handles loading and error states for visualizations

### SearchInput (`components/SearchInput.tsx`)

A simple search interface that:

- Accepts user input for PDB IDs
- Triggers structure search through the model
- Manages loading state for the search operation

### DescriptionPanel (`components/DescriptionPanel.tsx`)

Information display component that:

- Shows structure title and metadata
- Renders MVS-generated descriptions using Markdown
- Provides functionality to download MVS as JSON

## Code Documentation

The codebase is thoroughly documented using JSDoc comments to promote maintainability and ease of understanding:

### Interface Documentation

All interfaces include JSDoc comments describing their purpose and properties:

```typescript
/**
 * Interface representing structure information and metadata
 * @interface StructureInfo
 * @property {string} [title] - The title of the structure
 * @property {string} [description] - The description of the structure
 * @property {string} [mvsDescription] - MVS-generated description of the structure
 */
export interface StructureInfo {
  title?: string;
  description?: string;
  mvsDescription?: string;
}
```

### Function Documentation

Major functions include JSDoc comments describing their purpose, parameters, and return values:

```typescript
/**
 * Custom hook to use RxJS BehaviorSubject as React state
 * @template T - The type of the value in the BehaviorSubject
 * @param {BehaviorSubject<T>} subject - The BehaviorSubject to observe
 * @returns {T} The current value of the BehaviorSubject
 */
export function useBehavior<T>(subject: BehaviorSubject<T>): T {
  // Function implementation...
}
```

### Component Documentation

React components include JSDoc comments describing their purpose and props:

```typescript
/**
 * MolstarViewer component for molecular structure visualization
 * Handles initialization of Mol* viewer and programmatic MVS generation
 * 
 * @component
 * @param {MolstarViewerProps} props - Component props
 * @param {React.Ref<MolstarViewerRef>} ref - Forwarded ref for parent component access
 * @returns {JSX.Element} The MolstarViewer component
 */
const MolstarViewer = forwardRef<MolstarViewerRef, MolstarViewerProps>((props, ref) => {
  // Component implementation...
});
```

### Class Documentation

Classes include JSDoc comments describing their purpose and methods:

```typescript
/**
 * Main model class for the MolViewSpec application
 * Manages application state and provides data operations
 * @class MolViewSpecModel
 */
export class MolViewSpecModel {
  // Class implementation...
}
```

## Extending the Application

### Adding New Visualization Styles

To add a new visualization style to the molecular structure:

```typescript
// In MolstarViewer.tsx, modify the loadPdbById function:

// Build the MVS
const builder = MVSData.createBuilder();
const structure = builder
  .download({ url: `https://www.ebi.ac.uk/pdbe/entry-files/download/${pdbId}_updated.cif` })
  .parse({ format: 'mmcif' })
  .modelStructure();

// Existing representations
structure
  .component({ selector: 'polymer' })
  .representation({ type: 'cartoon' });

structure
  .component({ selector: 'ligand' })
  .representation({ type: 'ball_and_stick' });

// Add new representation
structure
  .component({ selector: 'water' })
  .representation({ type: 'sphere', color: 'uniform', colorValue: 0x0080FF });
```

### Adding Structure Metadata Sources

To integrate additional structure metadata sources:

```typescript
// In model.tsx, modify the fetchStructureData function:

private async fetchStructureData(pdbId: string): Promise<SearchResult> {
  try {
    // Add API call to fetch additional metadata
    const additionalData = await fetch(`https://your-metadata-api.com/${pdbId}`).then(r => r.json());
    
    // Merge with existing data
    return {
      id: pdbId,
      structureInfo: {
        title: additionalData.title || `Structure ${pdbId.toUpperCase()}`,
        description: additionalData.description || `### PDB Structure ${pdbId.toUpperCase()}`,
        // Add additional metadata fields
        authors: additionalData.authors,
        resolution: additionalData.resolution,
        releaseDate: additionalData.releaseDate
      }
    };
  } catch (error) {
    // Fallback to default data
    return {
      id: pdbId,
      structureInfo: {
        title: `Structure ${pdbId.toUpperCase()}`,
        description: `### PDB Structure ${pdbId.toUpperCase()}`
      }
    };
  }
}
```

### Creating Custom UI Components

To add a new UI component for additional functionality:

1. Create a new component file in the components directory:

```typescript
// components/StructureAnalysisPanel.tsx
import React from 'react';
import { useModel, useBehavior } from '../model';

const StructureAnalysisPanel: React.FC = () => {
  const model = useModel();
  const currentMVS = useBehavior(model.state.currentMVS);
  
  // Analysis logic here
  
  return (
    <div className="analysis-panel panel">
      <div className="panel-header">Structure Analysis</div>
      {/* Render analysis results */}
    </div>
  );
};

export default StructureAnalysisPanel;
```

2. Add the component to App.tsx:

```typescript
import StructureAnalysisPanel from './components/StructureAnalysisPanel';

// In the render function:
<div className="main-content">
  {/* Existing components */}
  <div className="analysis-section">
    <StructureAnalysisPanel />
  </div>
</div>
```

## Examples

### Example 1: Customizing Structure Representation

```typescript
// In MolstarViewer.tsx
const loadCustomStructure = async (pdbId: string, options = {}) => {
  const { showWater = false, ligandStyle = 'ball_and_stick' } = options;
  
  // Build the MVS
  const builder = MVSData.createBuilder();
  const structure = builder
    .download({ url: `https://www.ebi.ac.uk/pdbe/entry-files/download/${pdbId}_updated.cif` })
    .parse({ format: 'mmcif' })
    .modelStructure();
  
  // Protein representation
  structure
    .component({ selector: 'polymer' })
    .representation({ type: 'cartoon' });
  
  // Ligand representation with custom style
  structure
    .component({ selector: 'ligand' })
    .representation({ type: ligandStyle });
  
  // Conditional water representation
  if (showWater) {
    structure
      .component({ selector: 'water' })
      .representation({ type: 'sphere' });
  }
  
  // Create snapshot
  const snapshot = builder.getSnapshot({
    title: `Custom ${pdbId.toUpperCase()} Visualization`,
    description: `### Customized Structure View\n- Using ${ligandStyle} for ligands\n- Water molecules ${showWater ? 'shown' : 'hidden'}`,
    timestamp: new Date().toISOString()
  });
  
  // Load the MVS
  await loadMVS(plugin, snapshot, { replaceExisting: true });
};
```

### Example 2: Extending the Model with New Features

```typescript
// In model.tsx, extend the MolViewSpecModel class:

export class MolViewSpecModel {
  // Existing state...
  
  // Add new state subjects
  state = {
    // Existing state...
    
    // Add new state properties
    selectedAtoms: new BehaviorSubject<string[]>([]),
    measurementData: new BehaviorSubject<any>(null)
  };
  
  // Add new methods
  
  // Store selected atoms
  setSelectedAtoms(atomIds: string[]) {
    this.state.selectedAtoms.next(atomIds);
  }
  
  // Calculate and store measurements between atoms
  async calculateMeasurements(atom1: string, atom2: string) {
    // In a real app, this might use Mol* APIs for calculations
    const measurementData = {
      distance: 3.5, // Sample data
      atoms: [atom1, atom2]
    };
    
    this.state.measurementData.next(measurementData);
    return measurementData;
  }
}
```

### Example 3: Creating a Custom MVS Builder Function

```typescript
// Create a utility function to build different types of MVS based on structural features

// In a new file: src/utils/mvsBuilders.js
export const createProteinLigandMVS = (pdbId) => {
  const MVSData = window.molstar.PluginExtensions.mvs.MVSData;
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
  
  return builder.getSnapshot({
    title: `${pdbId.toUpperCase()} Structure`,
    description: `Standard protein-ligand view for ${pdbId}`,
    timestamp: new Date().toISOString()
  });
};

export const createCrystalPackingMVS = (pdbId) => {
  const MVSData = window.molstar.PluginExtensions.mvs.MVSData;
  const builder = MVSData.createBuilder();
  
  const structure = builder
    .download({ url: `https://www.ebi.ac.uk/pdbe/entry-files/download/${pdbId}_updated.cif` })
    .parse({ format: 'mmcif', assembly: 'crystal' })
    .modelStructure();
  
  structure
    .component({ selector: 'all' })
    .representation({ type: 'cartoon', colorTheme: 'chain-id' });
  
  return builder.getSnapshot({
    title: `${pdbId.toUpperCase()} Crystal Packing`,
    description: `Crystal packing view showing symmetric units`,
    timestamp: new Date().toISOString()
  });
};
```

These examples show different ways to extend and customize the application while maintaining its modular, component-based architecture.
