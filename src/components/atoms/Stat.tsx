import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number | null;
  unit?: string;
  unitClassName?: string;
  subValue?: React.ReactNode;
  valueIcon?: React.ReactNode;
}

const Stat = forwardRef<HTMLDivElement, StatProps>(({
  label,
  value,
  onClick,
  unit,
  unitClassName,
  subValue,
  valueIcon,
  className,
  ...props
}, ref) => {
  const clickableClasses = onClick
    ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
    : '';

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center text-center p-4 rounded-xl bg-card border border-border shadow-sm transition-all duration-200",
        clickableClasses,
        className
      )}
      onClick={onClick}
      title={typeof subValue === 'string' ? subValue : undefined}
      {...props}
    >
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-foreground">
        <span className="transition-all duration-200">
          {value ?? '-'}
          {unit && <span className={cn("ml-1 text-lg font-medium text-muted-foreground", unitClassName)}>{unit}</span>}
        </span>
        {valueIcon && <span className="text-blue-500 transition-transform duration-200 hover:scale-110">{valueIcon}</span>}
      </div>
      {subValue && <div className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]">{subValue}</div>}
    </div>
  );
});

Stat.displayName = 'Stat';

export default Stat;