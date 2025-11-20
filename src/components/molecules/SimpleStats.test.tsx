import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SimpleStats from './SimpleStats';
import { assertAccessible } from '../../tests/utils';

describe('SimpleStats', () => {
  it('should be accessible', async () => {
    await assertAccessible(<SimpleStats />);
  });

  it('should render the statistics', () => {
    render(<SimpleStats />);

    expect(screen.getByText('Total Rides: 123')).toBeInTheDocument();
    expect(screen.getByText('Total Distance: 4567 km')).toBeInTheDocument();
    expect(screen.getByText('Longest Ride: 89 km')).toBeInTheDocument();
  });
});