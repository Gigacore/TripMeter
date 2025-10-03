import React from 'react';

const Spinner: React.FC = () => (
  <div className="spinner-overlay" data-testid="spinner">
    <div className="spinner"></div>
  </div>
);

export default Spinner;