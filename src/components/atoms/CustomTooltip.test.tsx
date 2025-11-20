import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import CustomTooltip from './CustomTooltip';
import { assertAccessible } from '../../tests/utils';
import { TooltipPayload } from '../../types';

describe('CustomTooltip', () => {
  it('should be accessible', async () => {
    const payload: TooltipPayload[] = [
      {
        name: 'Distance',
        dataKey: 'distance',
        value: 123.456,
      },
    ];
    await assertAccessible(<CustomTooltip active={true} payload={payload} label="Test Label" />);
  });
});
