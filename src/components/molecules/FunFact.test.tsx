import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { FunFact } from './FunFact';
import { assertAccessible } from '../../tests/utils';
import { Coins } from 'lucide-react';

describe('FunFact', () => {
  it('should be accessible', async () => {
    await assertAccessible(
      <FunFact
        label="Test Label"
        value="Test Value"
        icon={Coins}
        description="Test Description"
        baseFact="Test Base Fact"
      />
    );
  });
});
