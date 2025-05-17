import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import type { MVSData_States } from 'molstar/lib/extensions/mvs/mvs-data';

/**
 * Metadata for MVS (MolViewSpec) data
 */
export interface MVSMetadata {
  /** Title of the visualization */
  title?: string;
  /** Description of the visualization */
  description?: string;
  /** Version of the MVS data */
  version?: string;
  /** Timestamp when the MVS data was created */
  timestamp?: string;
  /** Authors of the visualization */
  authors?: string[];
}

/**
 * Source information for a molecular structure
 */
export interface MVSSource {
  /** Type of source, e.g., 'download', 'url', etc. */
  kind: string;
  /** Additional parameters for the source */
  params: {
    /** URL to download the structure from */
    url?: string;
    [key: string]: any;
  };
}

/**
 * Component definition for MVS
 */
export interface MVSComponent {
  /** Selector for what part of the structure to apply the component to */
  selector: {
    /** Type name of the selector, e.g., 'polymer', 'ligand', etc. */
    string: string;
    [key: string]: any;
  };
  /** Representation to use for the component */
  representation: {
    /** Type of representation, e.g., 'cartoon', 'ball_and_stick', etc. */
    type: string;
    /** Color scheme to use */
    color?: string;
    /** Transparency level */
    alpha?: number;
    [key: string]: any;
  };
  /** Additional parameters */
  [key: string]: any;
}

/**
 * Cell for MVS structure node
 */
export interface MVSStructureCell {
  /** Type of cell */
  kind: string;
  /** Properties of the cell */
  props: {
    /** Source of the structure data */
    source?: MVSSource;
    /** Format of the structure data */
    format?: { name: string };
    /** Components in the structure */
    components?: MVSComponent[];
    /** Description of the cell */
    description?: string;
    [key: string]: any;
  };
}

/**
 * Node in the MVS tree
 */
export interface MVSNode {
  /** Reference ID for the node */
  ref: string;
  /** Transformation to apply */
  transform?: Record<string, any>;
  /** Cell data for the node */
  cell?: MVSStructureCell;
  /** Child node references */
  children?: string[];
  [key: string]: any;
}

/**
 * Tree structure for MVS data
 */
export interface MVSTree {
  /** Root node of the tree */
  root: MVSNode;
  /** Map of all nodes in the tree */
  [key: string]: MVSNode;
}

/**
 * Complete MVS data structure
 */
export interface MVSData {
  /** Metadata for the visualization */
  metadata: MVSMetadata;
  /** Tree structure defining the visualization */
  tree: MVSTree;
}

/**
 * Options for configuring the MolstarViewer component
 */
export interface MolstarViewerOptions {
  /** Whether to hide control UI elements */
  hideControls?: boolean;
  /** Whether to hide the toolbar */
  hideToolbar?: boolean;
  /** Whether to hide the sequence viewer */
  hideSequence?: boolean;
}

/**
 * Props for the MolstarViewer component
 */
export interface MolstarViewerProps {
  /** Width of the viewer container */
  width?: number | string;
  /** Height of the viewer container */
  height?: number | string;
  /** URL of a PDB file to load */
  pdbUrl?: string;
  /** MVS data to visualize */
  mvsData?: MVSData | MVSData_States;
  /** Options for configuring the viewer */
  options?: MolstarViewerOptions;
  /** Callback when a structure is loaded successfully */
  onStructureLoaded?: () => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * Props for the MolstarViewerContainer component
 */
export interface MolstarViewerContainerProps extends MolstarViewerProps {
  /** Class name to apply to the container */
  className?: string;
  /** Style object to apply to the container */
  style?: React.CSSProperties;
} 