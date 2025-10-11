import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StreaksAndPauses from './StreaksAndPauses';
import { CSVRow } from '@/services/csvParser';

vi.mock('lucide-react', () => ({
  Flame: () => <div data-testid="flame-icon" />,
  Pause: () => <div data-testid="pause-icon" />,
}));

vi.mock('../MostTripsInADay', () => ({
  default: () => <div data-testid="most-trips-in-a-day" />,
}));

vi.mock('../ConsecutiveTrips', () => ({
  default: () => <div data-testid="consecutive-trips" />,
}));

const mockProps = {
  longestStreak: { days: 10, startDate: new Date('2023-01-01').getTime(), endDate: new Date('2023-01-10').getTime() },
  longestGap: { days: 5, startDate: new Date('2023-02-01').getTime(), endDate: new Date('2023-02-05').getTime() },
  longestSuccessfulStreakBeforeCancellation: { count: 15, startDate: new Date('2023-03-01').getTime(), endDate: new Date('2023-03-15').getTime() },
  longestCancellationStreak: { count: 3, startDate: new Date('2023-04-01').getTime(), endDate: new Date('2023-04-03').getTime() },
  longestSuccessfulStreakBeforeDriverCancellation: { count: 20, startDate: new Date('2023-05-01').getTime(), endDate: new Date('2023-05-20').getTime() },
  longestDriverCancellationStreak: { count: 1, startDate: new Date('2023-06-01').getTime(), endDate: new Date('2023-06-01').getTime() },
  mostTripsInADay: { count: 5, date: new Date('2023-07-01').getTime(), trips: [] as CSVRow[] },
  longestConsecutiveTripsChain: [{ id: '1' }] as CSVRow[],
  onFocusOnTrip: vi.fn(),
};

describe('StreaksAndPauses', () => {
  it('should render all streak and pause statistics', () => {
    render(<StreaksAndPauses {...mockProps} />);

    expect(screen.getByTestId('most-trips-in-a-day')).toBeInTheDocument();
    expect(screen.getByTestId('consecutive-trips')).toBeInTheDocument();

    expect(screen.getByText('Longest Trip Streak')).toBeInTheDocument();
    expect(screen.getByText(/10 days/)).toBeInTheDocument();

    expect(screen.getByText('Longest Break')).toBeInTheDocument();
    expect(screen.getByText(/5 days/)).toBeInTheDocument();

    expect(screen.getByText('Uninterrupted Ride Streak')).toBeInTheDocument();
    expect(screen.getByText(/15 rides/)).toBeInTheDocument();

    expect(screen.getByText('Cancellation Streak')).toBeInTheDocument();
    expect(screen.getByText(/3 cancellations/)).toBeInTheDocument();

    expect(screen.getByText('Driver-Cancellation-Free Streak')).toBeInTheDocument();
    expect(screen.getByText(/20 rides/)).toBeInTheDocument();

    expect(screen.getByText('Driver Cancellation Streak')).toBeInTheDocument();
    expect(screen.getByText(/1 cancellation/)).toBeInTheDocument();
  });

  it('should correctly pluralize "day" and "ride"', () => {
    const singleDayProps = {
      ...mockProps,
      longestGap: { days: 1, startDate: new Date('2023-02-01').getTime(), endDate: new Date('2023-02-01').getTime() },
    };
    const { unmount } = render(<StreaksAndPauses {...singleDayProps} />);
    expect(screen.getByText('1 day')).toBeInTheDocument();
    unmount();

    const multiDayProps = {
        ...mockProps,
        longestGap: { days: 2, startDate: new Date('2023-02-01').getTime(), endDate: new Date('2023-02-02').getTime() },
      };
    render(<StreaksAndPauses {...multiDayProps} />);
    expect(screen.getByText('2 days')).toBeInTheDocument();

  });
});