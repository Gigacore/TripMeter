import { render, screen, fireEvent } from '@testing-library/react';
import * as userEvent from '@testing-library/user-event';
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
    expect(screen.getByRole('heading', { name: 'Trip Visualizer' })).toBeInTheDocument();
    expect(screen.getByText('Upload your ride history CSV to generate an interactive map and detailed analytics of your trips. See your travel patterns come to life.')).toBeInTheDocument();
    expect(screen.getByText('Drag & drop your CSV file here, or click to select')).toBeInTheDocument();
  });

  it('should display the processing state', () => {
    render(<LandingPage {...mockProps} isProcessing={true} />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.queryByText('Drag & drop your CSV file here, or click to select')).not.toBeInTheDocument();
  });

  it('should display an error message', () => {
    render(<LandingPage {...mockProps} error="Test Error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });

  it('should change style when dragging', () => {
    const { container } = render(<LandingPage {...mockProps} isDragging={true} />);
    const dropZone = container.querySelector('.border-2');
    expect(dropZone).toHaveClass('border-primary');
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

  it('should call onDrop when a file is dropped', () => {
    const { container } = render(<LandingPage {...mockProps} />);
    const dropZone = container.querySelector('.border-2');
    
    if (dropZone) {
      const file = new File([''], 'test.csv', { type: 'text/csv' });
      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [file],
        },
      });
      fireEvent(dropZone, dropEvent);
      expect(mockProps.onDrop).toHaveBeenCalledTimes(1);
    }
  });
});