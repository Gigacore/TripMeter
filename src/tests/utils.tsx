import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ReactElement } from 'react';

expect.extend(toHaveNoViolations);

export const assertAccessible = async (element: ReactElement): Promise<void> => {
  const { container } = render(element);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};
