import React, { useState } from 'react';

interface SearchProps {
  pdbId: string;
  onPdbIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Search: React.FC<SearchProps> = ({ pdbId, onPdbIdChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const commonPdbIds = [
    { id: '1tqn', name: 'Trypsin' },
    { id: '4hhb', name: 'Hemoglobin' },
    { id: '1ubq', name: 'Ubiquitin' },
    { id: '1bna', name: 'DNA double helix' },
    { id: '2jdi', name: 'ATP synthase' },
    { id: '1gfl', name: 'Green Fluorescent Protein' },
    { id: '3ptb', name: 'Trypsin-BPTI complex' },
    { id: '1cbs', name: 'Cellular Retinoic-Acid-Binding Protein' },
  ];
  
  const filteredPdbIds = searchTerm 
    ? commonPdbIds.filter(item => 
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : commonPdbIds;
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  return (
    <div className="search-panel">
      <h2>Search Structures</h2>
      
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search PDB ID or name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      
      <div className="search-results">
        <h3>Common Structures</h3>
        <ul className="pdb-list">
          {filteredPdbIds.map(item => (
            <li 
              key={item.id}
              className={pdbId === item.id ? 'selected' : ''}
              onClick={() => {
                const fakeEvent = {
                  target: { value: item.id }
                } as React.ChangeEvent<HTMLInputElement>;
                onPdbIdChange(fakeEvent);
              }}
            >
              <strong>{item.id}</strong>: {item.name}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="search-help">
        <h3>Help</h3>
        <p>Click on any structure to load it, or enter a valid PDB ID in the input field above.</p>
        <p>You can find more structures at <a href="https://www.rcsb.org" target="_blank" rel="noopener noreferrer">RCSB.org</a></p>
      </div>
    </div>
  );
};

export default Search; 