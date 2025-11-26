import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TripDurationDistribution from './TripDurationDistribution';
import { CSVRow } from '../../../services/csvParser';

// Mock Recharts
vi.mock('recharts', () => {
    const OriginalModule = vi.importActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
        BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
        XAxis: () => <div data-testid="x-axis" />,
        YAxis: () => <div data-testid="y-axis" />,
        Tooltip: () => <div data-testid="tooltip" />,
        Bar: () => <div data-testid="bar" />,
        CartesianGrid: () => <div data-testid="grid" />,
    };
});

describe('TripDurationDistribution', () => {
    it('renders no data message when rows are empty', () => {
        render(<TripDurationDistribution rows={[]} />);
        expect(screen.getByText('No completed trip data available for duration analysis.')).toBeInTheDocument();
    });

    it('renders chart when data is present', () => {
        const mockRows: CSVRow[] = [
            {
                status: 'completed',
                begin_trip_time: '2023-10-01T10:00:00Z',
                dropoff_time: '2023-10-01T10:10:00Z' // 10 mins
            },
            {
                status: 'completed',
                begin_trip_time: '2023-10-01T11:00:00Z',
                dropoff_time: '2023-10-01T11:07:00Z' // 7 mins
            },
        ];

        render(<TripDurationDistribution rows={mockRows} />);
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('filters out invalid durations', () => {
        const mockRows: CSVRow[] = [
            {
                status: 'completed',
                begin_trip_time: '2023-10-01T10:00:00Z',
                dropoff_time: '2023-10-01T09:00:00Z' // Negative duration
            },
        ];

        render(<TripDurationDistribution rows={mockRows} />);
        expect(screen.getByText('No completed trip data available for duration analysis.')).toBeInTheDocument();
    });
});
