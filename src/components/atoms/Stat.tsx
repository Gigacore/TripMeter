import React from 'react';

interface StatProps {
  label: string;
  value: string | number | null;
  onClick?: () => void;
  unit?: string;
  unitClassName?: string;
  subValue?: string | null;
}

const Stat: React.FC<StatProps> = ({ label, value, onClick, unit, unitClassName, subValue }) => {
  const clickableClasses = onClick
    ? 'cursor-pointer hover:bg-muted transition-colors duration-200 rounded-lg'
    : '';

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-2 ${clickableClasses}`}
      onClick={onClick}
      title={subValue ?? undefined}
    >
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className="text-2xl font-bold text-foreground mt-1">
        {value ?? '-'}
        {unit && <span className={`ml-1 text-lg font-medium text-muted-foreground ${unitClassName || ''}`}>{unit}</span>}
      </div>
      {subValue && <div className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]">{subValue}</div>}
    </div>
  );
};

export default Stat;