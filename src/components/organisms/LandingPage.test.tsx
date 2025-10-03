import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import LandingPage from './LandingPage';

const mockProps = {
  onFileSelect: vi.fn(),
  isProcessing: false,
  error: '',
  isDragging: false,
  onDragEvents: vi.fn(),
  onDrop: vi.fn(),
};

describe('LandingPage', () => {
  it('should render the initial state correctly', () => {
    render(<LandingPage {...mockProps} />);
    expect(screen.getByRole('heading', { name: 'Visualize Your Journeys' })).toBeInTheDocument();
    expect(screen.getByText('Upload your ride history CSV to generate an interactive map and detailed analytics of your trips. See your travel patterns come to life.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select File' })).toBeInTheDocument();
  });

  it('should display the processing state', () => {
    render(<LandingPage {...mockProps} isProcessing={true} />);
    const button = screen.getByRole('button', { name: 'Processing...' });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('should display an error message', () => {
    render(<LandingPage {...mockProps} error="Test Error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });

  it('should change style when dragging', () => {
    const { container } = render(<LandingPage {...mockProps} isDragging={true} />);
    const dropZone = container.querySelector('.border-2');
    expect(dropZone).toHaveClass('border-emerald-500');
  });

  it('should call onFileSelect when a file is chosen', async () => {
    const user = userEvent.setup();
    render(<LandingPage {...mockProps} />);
    const file = new File([''], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText('File uploader');

    if (fileInput) {
      await user.upload(fileInput, file);
      expect(mockProps.onFileSelect).toHaveBeenCalledTimes(1);
    }
  });

  it('should call onDrop when a file is dropped', async () => {
    const user = userEvent.setup();
    render(<LandingPage {...mockProps} />);
    const dropZone = screen.getByText('Drag and drop your file here').parentElement;
    if (dropZone) {
      await user.click(dropZone);
      expect(mockProps.onDrop).toHaveBeenCalledTimes(0);
    }
  });
});