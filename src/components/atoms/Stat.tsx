import React from 'react';

interface StatProps {
  label: string;
  value: string | number | null;
  onClick?: () => void;
  unit?: string;
  unitClassName?: string;
  subValue?: React.ReactNode;
  valueIcon?: React.ReactNode;
  className?: string;
}

const Stat: React.FC<StatProps> = ({ label, value, onClick, unit, unitClassName, subValue, valueIcon, className }) => {
  const clickableClasses = onClick
    ? 'cursor-pointer hover:bg-muted transition-colors duration-200 rounded-lg'
    : '';

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-2 ${clickableClasses} ${className || ''}`}
      onClick={onClick}
      title={typeof subValue === 'string' ? subValue : undefined}
    >
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-foreground mt-1">
        <span>
          {value ?? '-'}
          {unit && <span className={`ml-1 text-lg font-medium text-muted-foreground ${unitClassName || ''}`}>{unit}</span>}
        </span>
        {valueIcon && <span className="text-blue-500">{valueIcon}</span>}
      </div>
      {subValue && <div className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]">{subValue}</div>}
    </div>
  );
};

export default Stat;