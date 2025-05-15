// Using a simplified approach to avoid TypeScript errors
// while still generating valid MVS data structure

export interface MVSOptions {
  title?: string;
  description?: string;
}

// Creates a basic MVS view with standard representations
export function createBasicMVS(pdbId: string, options: MVSOptions = {}) {
  // Create a minimal valid MVS data structure manually
  return {
    metadata: {
      title: options.title || `Structure ${pdbId}`,
      description: options.description || `Visualization of ${pdbId}`,
      version: "1.0",
      timestamp: new Date().toISOString()
    },
    tree: {
      root: {
        ref: "root",
        transform: { },
        children: ["structure"]
      },
      structure: {
        ref: "structure",
        transf: { },
        cell: {
          kind: "structure",
          props: {
            source: {
              kind: "download",
              params: {
                url: `https://files.rcsb.org/download/${pdbId}.cif`
              }
            },
            format: { name: "mmcif" },
            components: [
              {
                selector: { string: "polymer" },
                representation: { type: "cartoon" }
              },
              {
                selector: { string: "ligand" },
                representation: { type: "ball_and_stick" }
              }
            ]
          }
        }
      }
    }
  };
}

// Creates an MVS with multiple views of the same structure
export function createExplainedMVS(pdbId: string, options: MVSOptions = {}) {
  return {
    metadata: {
      title: options.title || `Explained Structure ${pdbId}`,
      description: options.description || `Interactive visualization of ${pdbId} with multiple views`,
      version: "1.0",
      timestamp: new Date().toISOString()
    },
    tree: {
      root: {
        ref: "root",
        transform: { },
        children: ["download"]
      },
      download: {
        ref: "download",
        transform: { },
        cell: {
          kind: "data",
          props: {
            source: {
              kind: "download",
              params: {
                url: `https://files.rcsb.org/download/${pdbId}.cif`
              }
            }
          }
        },
        children: ["parse"]
      },
      parse: {
        ref: "parse",
        transform: { },
        cell: {
          kind: "parse",
          props: {
            format: { name: "mmcif" }
          }
        },
        children: ["structure", "view1", "view2"]
      },
      structure: {
        ref: "structure",
        transform: { },
        cell: {
          kind: "structure",
          props: {
            description: "Complete Structure",
            components: [
              {
                selector: { string: "polymer" },
                representation: { type: "cartoon" }
              },
              {
                selector: { string: "ligand" },
                representation: { type: "ball_and_stick" }
              }
            ]
          }
        }
      },
      view1: {
        ref: "view1",
        transform: { },
        cell: {
          kind: "structure",
          props: {
            description: "Cartoon View",
            components: [
              {
                selector: { string: "polymer" },
                representation: { type: "cartoon" }
              }
            ]
          }
        }
      },
      view2: {
        ref: "view2",
        transform: { },
        cell: {
          kind: "structure",
          props: {
            description: "Surface View",
            components: [
              {
                selector: { string: "polymer" },
                representation: { type: "surface" }
              },
              {
                selector: { string: "ligand" },
                representation: { type: "ball_and_stick" }
              }
            ]
          }
        }
      }
    }
  };
}

export default {
  createBasicMVS,
  createExplainedMVS
}; 