import React from 'react';

interface SearchProps {
  width?: string;
  height?: string;
}

const Search: React.FC<SearchProps> = ({ width = '100%', height = '100%' }) => {
  return (
    <div style={{ width, height, padding: '10px' }}>
      <h3>Search</h3>
      {/* Search functionality will go here */}
    </div>
  );
};

export default Search; 