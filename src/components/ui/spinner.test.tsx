import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Spinner } from './spinner';

// Mock lucide-react icon
vi.mock('lucide-react', () => ({
  Loader2Icon: (props: any) => <svg data-testid="loader-icon" {...props} />,
}));

vi.mock('@/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

describe('Spinner', () => {
  it('should render with default classes', () => {
    render(<Spinner />);
    const spinner = screen.getByTestId('loader-icon');
    expect(spinner).toHaveClass('size-8 animate-spin');
  });

  it('should accept and apply additional classes', () => {
    render(<Spinner className="text-primary" />);
    const spinner = screen.getByTestId('loader-icon');
    expect(spinner).toHaveClass('size-8 animate-spin text-primary');
  });

  it('should have correct accessibility attributes', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });
});