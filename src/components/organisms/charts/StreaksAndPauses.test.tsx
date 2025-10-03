import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StreaksAndPauses from './StreaksAndPauses';
import { TripStats } from '../../../hooks/useTripData';

vi.mock('lucide-react', () => ({
  Flame: () => <div data-testid="flame-icon" />,
  Pause: () => <div data-testid="pause-icon" />,
}));

const mockProps: {
  longestStreak: TripStats['longestStreak'];
  longestGap: TripStats['longestGap'];
  longestSuccessfulStreakBeforeCancellation: TripStats['longestSuccessfulStreakBeforeCancellation'];
  longestCancellationStreak: TripStats['longestCancellationStreak'];
  longestSuccessfulStreakBeforeDriverCancellation: TripStats['longestSuccessfulStreakBeforeDriverCancellation'];
  longestDriverCancellationStreak: TripStats['longestDriverCancellationStreak'];
} = {
  longestStreak: { days: 10, startDate: new Date('2023-01-01').getTime(), endDate: new Date('2023-01-10').getTime() },
  longestGap: { days: 5, startDate: new Date('2023-02-01').getTime(), endDate: new Date('2023-02-05').getTime() },
  longestSuccessfulStreakBeforeCancellation: { count: 15, startDate: new Date('2023-03-01').getTime(), endDate: new Date('2023-03-15').getTime() },
  longestCancellationStreak: { count: 3, startDate: new Date('2023-04-01').getTime(), endDate: new Date('2023-04-03').getTime() },
  longestSuccessfulStreakBeforeDriverCancellation: { count: 20, startDate: new Date('2023-05-01').getTime(), endDate: new Date('2023-05-20').getTime() },
  longestDriverCancellationStreak: { count: 1, startDate: new Date('2023-06-01').getTime(), endDate: new Date('2023-06-01').getTime() },
};

describe('StreaksAndPauses', () => {
  it('should render all streak and pause statistics', () => {
    render(<StreaksAndPauses {...mockProps} />);

    expect(screen.getByText('Longest Streak')).toBeInTheDocument();
    expect(screen.getByText(/10 days/)).toBeInTheDocument();

    expect(screen.getByText('Longest Pause')).toBeInTheDocument();
    expect(screen.getByText(/5 days/)).toBeInTheDocument();

    expect(screen.getByText('Longest Successful Rides Before Any Cancellation')).toBeInTheDocument();
    expect(screen.getByText(/15 rides/)).toBeInTheDocument();

    expect(screen.getByText('Longest Cancellation Streak (Rider & Driver)')).toBeInTheDocument();
    expect(screen.getByText(/3 cancellations/)).toBeInTheDocument();

    expect(screen.getByText('Longest Successful Rides Before Driver Cancellation')).toBeInTheDocument();
    expect(screen.getByText(/20 rides/)).toBeInTheDocument();

    expect(screen.getByText('Longest Driver Cancellation Streak')).toBeInTheDocument();
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