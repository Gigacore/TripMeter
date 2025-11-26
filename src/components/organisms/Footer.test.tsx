import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import Footer from './Footer';
import { assertAccessible } from '../../tests/utils';

describe('Footer', () => {
  it('should be accessible', async () => {
    await assertAccessible(<Footer />);
  });
});
