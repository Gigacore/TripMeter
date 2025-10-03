import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PriceDisplay from './PriceDisplay';
import * as currencyUtils from '../../utils/currency';

vi.mock('../../utils/currency', () => ({
  formatCurrency: vi.fn(),
}));

describe('PriceDisplay', () => {
  it('should render the formatted price', () => {
    (currencyUtils.formatCurrency as vi.Mock).mockReturnValue('$123.45');

    render(<PriceDisplay amount={123.45} currency="USD" />);

    expect(screen.getByText('$123.45')).toBeInTheDocument();
  });

  it('should call formatCurrency with the correct arguments', () => {
    render(<PriceDisplay amount={123.45} currency="USD" locale="en-GB" />);

    expect(currencyUtils.formatCurrency).toHaveBeenCalledWith(123.45, 'USD', 'en-GB');
  });

  it('should call formatCurrency with default locale when not provided', () => {
    render(<PriceDisplay amount={123.45} currency="USD" />);

    expect(currencyUtils.formatCurrency).toHaveBeenCalledWith(123.45, 'USD', undefined);
  });
});