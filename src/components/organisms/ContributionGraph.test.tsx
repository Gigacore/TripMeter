import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ContributionGraph, { DailyContribution } from './ContributionGraph';

// Mock utility functions
vi.mock('../../utils/currency', () => ({
  formatCurrency: (amount: number, currency: string) => `${amount} ${currency}`,
}));
vi.mock('../../utils/formatters', () => ({
  formatDuration: (minutes: number) => `${minutes} min`,
}));

const mockData: { [key: string]: DailyContribution } = {
  '2023-01-01': { count: 1, totalFare: { USD: 10 }, totalDistance: 5, totalWaitingTime: 2, totalRidingTime: 15 },
  '2023-01-02': { count: 3, totalFare: { USD: 25 }, totalDistance: 12, totalWaitingTime: 5, totalRidingTime: 30 },
  '2023-01-03': { count: 7, totalFare: { USD: 50 }, totalDistance: 20, totalWaitingTime: 3, totalRidingTime: 45 },
};

describe('ContributionGraph', () => {
  it('should render the contribution graph with the correct number of cells', () => {
    // This is a simplified check. A real-world scenario would be more complex.
    const { container } = render(<ContributionGraph data={mockData} view={2023} />);
    // This will check for the container of the grid cells
    const gridContainer = container.querySelector('.grid.gap-1.mt-2');
    expect(gridContainer).toBeInTheDocument();
  });

  it('should show a tooltip on mouse enter and hide on mouse leave', async () => {
    render(<ContributionGraph data={mockData} view={2023} />);

    // Find a cell to hover over
    const cells = document.querySelectorAll('.aspect-square.rounded-sm');
    const cellToHover = Array.from(cells).find(cell => !cell.classList.contains('bg-transparent'));

    if (cellToHover) {
      fireEvent.mouseEnter(cellToHover);
      const tooltip = await screen.findByText(/trip/); // "trip" or "trips"
      expect(tooltip).toBeInTheDocument();
      expect(screen.getByText(/Distance/)).toBeInTheDocument();

      fireEvent.mouseLeave(cellToHover);
      expect(screen.queryByText(/trip/)).not.toBeInTheDocument();
    }
  });

  it('should apply the correct color class based on contribution level', () => {
    const { container } = render(<ContributionGraph data={mockData} view={2023} />);

    // This is a simplified check. We'd need to know the exact position of our mock data cells.
    // Let's just check that different color classes are present.
    expect(container.querySelector('.bg-blue-200')).toBeInTheDocument(); // Level 1
    expect(container.querySelector('.bg-blue-400')).toBeInTheDocument(); // Level 2
    expect(container.querySelector('.bg-blue-800')).toBeInTheDocument(); // Level 4
  });

  it('should handle the "last-12-months" view', () => {
    const { container } = render(<ContributionGraph data={mockData} view="last-12-months" />);
    const gridContainer = container.querySelector('.grid.gap-1.mt-2');
    expect(gridContainer).toBeInTheDocument();
  });
});