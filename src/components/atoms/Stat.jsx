import React from 'react';

const Stat = ({ label, value, onClick, unit, unitClassName }) => (
  <div className={`stat ${onClick ? 'clickable' : ''}`} onClick={onClick}>
    <div>{label}</div>
    <div className="stat-value">
      {value}
      {unit && <span className={`stat-unit ${unitClassName || ''}`}>{unit}</span>}
    </div>
  </div>
);

export default Stat;