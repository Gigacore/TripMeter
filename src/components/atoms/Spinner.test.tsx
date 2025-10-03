import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Spinner from './Spinner';

describe('Spinner', () => {
  it('should render the spinner component', () => {
    render(<Spinner />);

    const spinnerOverlay = screen.getByTestId('spinner');
    expect(spinnerOverlay).toBeInTheDocument();
    expect(spinnerOverlay).toHaveClass('spinner-overlay');

    const spinner = spinnerOverlay.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
  });
});