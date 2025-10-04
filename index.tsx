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
