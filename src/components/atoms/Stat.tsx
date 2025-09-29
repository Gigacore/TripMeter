import React from 'react';

interface StatProps {
  label: string;
  value: string | number;
  onClick?: () => void;
  unit?: string;
  unitClassName?: string;
}

const Stat: React.FC<StatProps> = ({ label, value, onClick, unit, unitClassName }) => (
  <div className={`stat ${onClick ? 'clickable' : ''}`} onClick={onClick}>
    <div>{label}</div>
    <div className="stat-value">
      {value}
      {unit && <span className={`stat-unit ${unitClassName || ''}`}>{unit}</span>}
    </div>
  </div>
);

export default Stat;