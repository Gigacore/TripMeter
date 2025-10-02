import React from 'react';

const Spinner: React.FC = () => (
  <div className="spinner-overlay" role="status" aria-live="polite">
    <div className="spinner"></div>
    <span className="sr-only">Loading...</span>
  </div>
);

export default Spinner;