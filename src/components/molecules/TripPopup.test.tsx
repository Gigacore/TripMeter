import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TripPopup from './TripPopup';
import { CSVRow } from '../../services/csvParser';

// Mock the UI components to avoid issues with missing contexts or complex rendering
vi.mock('../ui/card', () => ({
    Card: ({ children, className }: any) => <div className={`mock-card ${className}`}>{children}</div>,
    CardContent: ({ children, className }: any) => <div className={`mock-card-content ${className}`}>{children}</div>,
    CardHeader: ({ children, className }: any) => <div className={`mock-card-header ${className}`}>{children}</div>,
    CardTitle: ({ children, className }: any) => <div className={`mock-card-title ${className}`}>{children}</div>,
}));

vi.mock('../ui/badge', () => ({
    Badge: ({ children, className }: any) => <div className={`mock-badge ${className}`}>{children}</div>,
}));

const mockTrip: CSVRow = {
    request_time: '2023-10-27 10:00:00',
    begin_trip_time: '2023-10-27 10:05:00',
    dropoff_time: '2023-10-27 10:20:00',
    city: 'San Francisco',
    product_type: 'UberX',
    status: 'completed',
    begintrip_address: '123 Start St',
    dropoff_address: '456 End Ave',
    distance: '5.0',
    fare_amount: '25.50',
    fare_currency: 'USD',
    begintrip_lat: '37.7749',
    begintrip_lng: '-122.4194',
    dropoff_lat: '37.7849',
    dropoff_lng: '-122.4094',
};

describe('TripPopup', () => {
    const convertDistance = (miles: number) => miles;

    it('renders pickup details correctly', () => {
        render(
            <TripPopup
                data={mockTrip}
                pointType="begin"
                distanceUnit="miles"
                convertDistance={convertDistance}
            />
        );

        expect(screen.getByText('Pickup Location')).toBeInTheDocument();
        expect(screen.getByText('123 Start St')).toBeInTheDocument();
        expect(screen.getByText('completed')).toBeInTheDocument();
    });

    it('renders dropoff details correctly', () => {
        render(
            <TripPopup
                data={mockTrip}
                pointType="drop"
                distanceUnit="miles"
                convertDistance={convertDistance}
            />
        );

        expect(screen.getByText('Dropoff Location')).toBeInTheDocument();
        expect(screen.getByText('456 End Ave')).toBeInTheDocument();
    });

    it('formats currency correctly', () => {
        render(
            <TripPopup
                data={mockTrip}
                pointType="begin"
                distanceUnit="miles"
                convertDistance={convertDistance}
            />
        );
        // Assuming formatCurrency mocks or implementation works, checking for presence of value
        // We might need to adjust based on actual formatCurrency output if it relies on locale
        // But here we just check if it renders.
        // Since we didn't mock formatCurrency, it uses the real one.
        // Let's check for the number at least.
        expect(screen.getByText((content) => content.includes('$25.50'))).toBeInTheDocument();
    });

    it('calculates and displays wait time', () => {
        render(
            <TripPopup
                data={mockTrip}
                pointType="begin"
                distanceUnit="miles"
                convertDistance={convertDistance}
            />
        );
        // 10:00 to 10:05 is 5 minutes
        expect(screen.getByText('5.0 min')).toBeInTheDocument();
    });

    it('calculates and displays average speed', () => {
        render(
            <TripPopup
                data={mockTrip}
                pointType="begin"
                distanceUnit="miles"
                convertDistance={convertDistance}
            />
        );
        // 5 miles in 15 mins (0.25 hours) = 20 mph
        expect(screen.getByText('20.0 mph')).toBeInTheDocument();
    });
});
