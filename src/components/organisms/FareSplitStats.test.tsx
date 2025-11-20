import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import FareSplitStats from './FareSplitStats';
import { assertAccessible } from '../../tests/utils';
import { CSVRow } from '../../services/csvParser';

const mockRows: CSVRow[] = [
  {
    status: 'fare_split',
    fare_amount: '30.0',
    fare_currency: 'USD',
  },
  {
    status: 'completed',
    fare_amount: '20.0',
    fare_currency: 'USD',
  },
  {
    status: 'fare_split',
    fare_amount: '15.0',
    fare_currency: 'EUR',
  },
];

describe('FareSplitStats', () => {
  it('should be accessible when there are fare split rides', async () => {
    await assertAccessible(<FareSplitStats rows={mockRows} />);
  });

  it('should be accessible when there are no fare split rides', async () => {
    await assertAccessible(<FareSplitStats rows={[]} />);
  });
});
