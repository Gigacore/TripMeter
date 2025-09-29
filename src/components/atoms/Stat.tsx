import React from 'react';

interface StatProps {
  label: string;
  value: string | number | null;
  onClick?: () => void;
  unit?: string;
  unitClassName?: string;
  subValue?: string | null;
}

const Stat: React.FC<StatProps> = ({ label, value, onClick, unit, unitClassName, subValue }) => (
  <div className={`stat ${onClick ? 'clickable' : ''}`} onClick={onClick} title={subValue ?? undefined}>
    <div>{label}</div>
    <div className="stat-value">
      {value}
      {unit && <span className={`stat-unit ${unitClassName || ''}`}>{unit}</span>}
    </div>
    {subValue && <div className="stat-subvalue">{subValue}</div>}
  </div>
);

export default Stat;