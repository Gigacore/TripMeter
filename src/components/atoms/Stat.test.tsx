import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Stat from './Stat';

describe('Stat', () => {
  it('should render the label and value', () => {
    render(<Stat label="Test Label" value="Test Value" />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('should render the unit when provided', () => {
    render(<Stat label="Test Label" value="123" unit="kg" />);

    expect(screen.getByText('kg')).toBeInTheDocument();
  });

  it('should render the sub-value when provided', () => {
    render(<Stat label="Test Label" value="123" subValue="Sub Value" />);

    expect(screen.getByText('Sub Value')).toBeInTheDocument();
  });

  it('should call the onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Stat label="Test Label" value="123" onClick={handleClick} />);

    fireEvent.click(screen.getByText('Test Label'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should display a dash when the value is null', () => {
    render(<Stat label="Test Label" value={null} />);

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should have clickable classes when onClick is provided', () => {
    const handleClick = vi.fn();
    const { container } = render(<Stat label="Test Label" value="123" onClick={handleClick} />);

    expect(container.firstChild).toHaveClass('cursor-pointer');
  });

  it('should not have clickable classes when onClick is not provided', () => {
    const { container } = render(<Stat label="Test Label" value="123" />);

    expect(container.firstChild).not.toHaveClass('cursor-pointer');
  });
});