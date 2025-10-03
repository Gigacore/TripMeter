import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Label } from './label';

describe('Label', () => {
  it('should render the label with its text', () => {
    render(<Label htmlFor="test-input">Test Label</Label>);

    const labelElement = screen.getByText('Test Label');
    expect(labelElement).toBeInTheDocument();
    expect(labelElement).toHaveAttribute('for', 'test-input');
  });

  it('should apply the correct base classes', () => {
    render(<Label>Test Label</Label>);
    const labelElement = screen.getByText('Test Label');
    expect(labelElement).toHaveClass('text-sm', 'font-medium', 'leading-none');
  });
});