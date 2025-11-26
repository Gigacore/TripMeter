import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RideSummary from './RideSummary';
import { TripStats } from '../../hooks/useTripData';
import { CSVRow } from '../../services/csvParser';

// Mock formatCurrency and formatDuration since they are used in the component
vi.mock('../../utils/currency', () => ({
    formatCurrency: (amount: number, currency: string) => `${currency} ${amount.toFixed(2)}`,
}));

vi.mock('../../utils/formatters', () => ({
    formatDuration: (minutes: number) => `${Math.round(minutes)} min`,
}));

const mockTripStats: TripStats = {
    successfulTrips: 100,
    totalCompletedDistance: 500,
    totalFareByCurrency: { USD: 1500 },
    avgCompletedDistance: 5,
    avgTripDuration: 15,
    mostSuccessfulTripsInADay: {
        count: 10,
        date: new Date('2023-01-01').getTime(),
        trips: [],
    },
    // Add other required properties with default/dummy values
    beginCount: 0,
    dropoffCount: 0,
    avgSpeed: 0,
    longestTrip: 0,
    longestTripByDist: 0,
    shortestTrip: 0,
    shortestTripByDist: 0,
    longestTripRow: null,
    totalWaitingTime: 0,
    avgWaitingTime: 0,
    shortestWaitingTime: 0,
    longestWaitingTime: 0,
    shortestWaitingTimeRow: null,
    longestWaitingTimeRow: null,
    waitingLongerThanTripCount: 0,
    totalWaitingTimeForLongerWaits: 0,
    totalRidingTimeForLongerWaits: 0,
    fastestTripBySpeed: 0,
    fastestTripBySpeedRow: null,
    speedDistribution: [],
    slowestTripBySpeed: 0,
    slowestTripBySpeedRow: null,
    longestTripByDistRow: null,
    shortestTripRow: null,
    shortestTripByDistRow: null,
    totalTripDuration: 0,
    totalTrips: 0,
    riderCanceledTrips: 0,
    driverCanceledTrips: 0,
    canceledTrips: 0,
    unfulfilledTrips: 0,
    avgFareByCurrency: {},
    lowestFareByCurrency: {},
    highestFareByCurrency: {},
    costPerDistanceByCurrency: {},
    costPerDurationByCurrency: {},
    avgCostPerDistanceByYear: {},
    totalFareByYear: {},
    longestStreak: { days: 0, startDate: null, endDate: null },
    longestGap: { days: 0, startDate: null, endDate: null },
    longestSuccessfulStreakBeforeCancellation: { count: 0, startDate: null, endDate: null },
    longestCancellationStreak: { count: 0, startDate: null, endDate: null },
    longestSuccessfulStreakBeforeDriverCancellation: { count: 0, startDate: null, endDate: null },
    longestDriverCancellationStreak: { count: 0, startDate: null, endDate: null },
    tripsByYear: [],
    avgSpeedByDayOfWeek: [],
    longestConsecutiveTripsChain: [],
    convertDistance: (d) => d,
};

const mockRows: CSVRow[] = [
    { city: 'New York', status: 'completed' } as CSVRow,
    { city: 'New York', status: 'completed' } as CSVRow,
    { city: 'London', status: 'completed' } as CSVRow,
];

describe('RideSummary', () => {
    it('renders summary with correct data', () => {
        render(<RideSummary data={mockTripStats} rows={mockRows} distanceUnit="miles" />);

        expect(screen.getByText(/100/)).toBeInTheDocument(); // successfulTrips
        expect(screen.getByText(/500.00 mi/)).toBeInTheDocument(); // totalCompletedDistance
        expect(screen.getByText(/USD 1500.00/)).toBeInTheDocument(); // totalFare
        expect(screen.getByText(/5.00 mi/)).toBeInTheDocument(); // avgCompletedDistance
        expect(screen.getByText(/15 min/)).toBeInTheDocument(); // avgTripDuration
        expect(screen.getByText(/New York/)).toBeInTheDocument(); // mostVisitedCity
        expect(screen.getByText('2')).toBeInTheDocument(); // count for New York
    });

    it('renders nothing if no successful trips', () => {
        const emptyStats = { ...mockTripStats, successfulTrips: 0 };
        const { container } = render(<RideSummary data={emptyStats} rows={[]} distanceUnit="miles" />);
        expect(container).toBeEmptyDOMElement();
    });
});
