import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import Dashboard from './Dashboard';
import { assertAccessible } from '../../tests/utils';

vi.mock('./Stats', () => ({
  default: () => <div data-testid="mock-stats"></div>,
}));

describe('Dashboard', () => {
  it('should be accessible', async () => {
    await assertAccessible(
      <Dashboard
        data={{} as any}
        onFocusOnTrip={() => {}}
        onFocusOnTrips={() => {}}
        onShowTripList={() => {}}
        distanceUnit="miles"
        rows={[]}
      />
    );
  });
});
