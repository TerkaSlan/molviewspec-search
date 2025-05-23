# Mol* MVS Demo Todo List

## State Management
- [x] Adopt state passing mechanism from alphafind-offline-demo
- [x] Enhance DescriptionPanel component
  - [x] Refactor to display MVS descriptions
  - [x] Add support for snapshot metadata display
  - [ ] Implement collapsible/expandable sections for detailed information

## Interface Implementation
- [ ] Create interfaces for AlphaFind
  - [ ] Implement AlphaFindInfo interface
  - [ ] Implement AlphaFindStructure interface
  - [ ] Add support for TM-score, RMSD, and alignment percentage
  - [ ] Implement rotation matrix and translation vector handling
  - [ ] Create helper functions for AlphaFind data processing

- [ ] Create interfaces for FoldSeek
  - [ ] Define FoldSeekResult interface
  - [ ] Implement FoldSeek-specific properties
  - [ ] Add support for structure alignment metadata

## Data Flow
- [ ] Implement data loading mechanisms
  - [ ] Create utilities for loading MVS files from local and remote sources
  - [ ] Implement data transformation functions
  - [ ] Add error handling for failed data loading

## UI Improvements
- [ ] Enhance search functionality
  - [ ] Support for searching by different identifiers (PDB, UniProt)
  - [ ] Add autocomplete suggestions
  - [ ] Implement search history

- [ ] Add results panel
  - [ ] Display search results with similarity metrics
  - [ ] Add sorting and filtering capabilities
  - [ ] Implement pagination for large result sets

## Documentation
- [ ] Update README.md with new features
- [ ] Add JSDoc comments to all interfaces and major functions
- [ ] Create usage examples for new components

## Testing
- [ ] Add unit tests for new components
- [ ] Create integration tests for state management
- [ ] Test with example MVS files from different sources 

## Deployment
- [ ] Create a docker image