import React from 'react';

interface DescriptionProps {
  width?: string;
  height?: string;
}

const Description: React.FC<DescriptionProps> = ({ width = '100%', height = '100%' }) => {
  return (
    <div style={{ width, height, padding: '10px' }}>
      <h3>Description</h3>
      {/* Description content will go here */}
    </div>
  );
};

export default Description; 