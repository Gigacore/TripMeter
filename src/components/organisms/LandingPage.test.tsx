import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LandingPage from './LandingPage';

describe('LandingPage', () => {
  const defaultProps = {
    onFileSelect: vi.fn(),
    isProcessing: false,
    error: '',
    isDragging: false,
    onDragEvents: vi.fn(),
    onDrop: vi.fn(),
  };

  it('renders the hero section correctly', () => {
    render(<LandingPage {...defaultProps} />);
    expect(screen.getByText(/Visualize Your/i)).toBeInTheDocument();
    expect(screen.getByText(/Uber History/i)).toBeInTheDocument();
    expect(screen.getByText(/Uber History/i)).toBeInTheDocument();
  });

  it('renders the upload section correctly', () => {
    render(<LandingPage {...defaultProps} />);
    expect(screen.getByText(/Drop your file/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag & drop your/i)).toBeInTheDocument();
  });

  it('shows processing state', () => {
    render(<LandingPage {...defaultProps} isProcessing={true} />);
    expect(screen.getByText(/Crunching the numbers/i)).toBeInTheDocument();
  });

  it('shows error message', () => {
    const errorMsg = "Invalid file format";
    render(<LandingPage {...defaultProps} error={errorMsg} />);
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(<LandingPage {...defaultProps} />);
    expect(screen.getByText(/Interactive Map/i)).toBeInTheDocument();
    expect(screen.getByText(/Deep Analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/Time Patterns/i)).toBeInTheDocument();
  });
});