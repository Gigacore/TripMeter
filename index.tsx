import React from 'react';
import currency from 'currency.js';
import { DataCategory, TooltipPayload } from '@/types';

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const categoryConfig: Record<
  DataCategory,
  { color: string; prefix?: string; suffix?: string; formatter: (value: number) => string }
> = {
  monetary: {
    color: 'bg-green-500',
    formatter: (value) => currency(value, { symbol: '$', precision: 2 }).format(),
  },
  cancellation: {
    color: 'bg-red-600',
    suffix: ' trips',
    formatter: (value) => value.toString(),
  },
  distance: {
    color: 'bg-blue-500',
    suffix: ' mi',
    formatter: (value) => value.toFixed(2),
  },
  duration: {
    color: 'bg-amber-500',
    suffix: ' min',
    formatter: (value) => value.toFixed(1),
  },
  count: {
    color: 'bg-indigo-500',
    suffix: ' trips',
    formatter: (value) => Math.round(value).toString(),
  },
  efficiency: {
    color: 'bg-teal-500',
    suffix: ' mpg',
    formatter: (value) => value.toFixed(1),
  },
  general: {
    color: 'bg-gray-400',
    formatter: (value) => value.toString(),
  },
};

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-2">
          <p className="text-sm font-bold text-foreground">{label}</p>
          {payload.map((pld) => {
            const category = pld.dataKey as DataCategory;
            const config = categoryConfig[category] || categoryConfig.general;
            if (pld.value === undefined || pld.value === null) return null;

            return (
              <div key={pld.dataKey} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${config.color}`} />
                  <p className="text-sm text-muted-foreground">{pld.name}</p>
                </div>
                <p className="text-right text-sm font-medium text-foreground">
                  {config.prefix}
                  {config.formatter(pld.value as number)}
                  {config.suffix}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};