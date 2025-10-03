import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CurrencyList from './CurrencyList';
import * as currencyUtils from '../../utils/currency';

vi.mock('../../utils/currency', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        getAllCurrencies: vi.fn(),
    };
});

const mockCurrencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
];

describe('CurrencyList', () => {
  it('should render a list of currencies', () => {
    (currencyUtils.getAllCurrencies as vi.Mock).mockReturnValue(mockCurrencies);

    render(<CurrencyList />);

    expect(screen.getByText('US Dollar')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();

    expect(screen.getByText('Euro')).toBeInTheDocument();
    expect(screen.getByText('EUR')).toBeInTheDocument();
    expect(screen.getByText('€')).toBeInTheDocument();
  });

  it('should render the heading', () => {
    (currencyUtils.getAllCurrencies as vi.Mock).mockReturnValue([]);

    render(<CurrencyList />);

    expect(screen.getByRole('heading', { name: 'Currencies' })).toBeInTheDocument();
  });

  it('should render nothing when there are no currencies', () => {
    (currencyUtils.getAllCurrencies as vi.Mock).mockReturnValue([]);

    render(<CurrencyList />);

    expect(screen.queryByText('US Dollar')).not.toBeInTheDocument();
  });
});