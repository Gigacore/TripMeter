import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import DashboardNav from './DashboardNav';
import { assertAccessible } from '../../tests/utils';

const sections = [
  { id: 'section-1', title: 'Section 1' },
  { id: 'section-2', title: 'Section 2' },
];

describe('DashboardNav', () => {
  it('should be accessible', async () => {
    await assertAccessible(<DashboardNav sections={sections} activeSection="section-1" />);
  });
});
