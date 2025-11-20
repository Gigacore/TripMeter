import { render, screen, fireEvent } from '@testing-library/react';
import * as userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import LandingPage from './LandingPage';
import { assertAccessible } from '../../tests/utils';

const mockProps = {
  onFileSelect: vi.fn(),
  isProcessing: false,
  error: '',
  isDragging: false,
  onDragEvents: vi.fn(),
  onDrop: vi.fn(),
};

describe('LandingPage', () => {
  it('should be accessible', async () => {
    await assertAccessible(<LandingPage {...mockProps} />);
  });

  it('should render the initial state correctly', () => {
    render(<LandingPage {...mockProps} />);
    expect(screen.getByRole('heading', { name: 'Visualize Your Rides' })).toBeInTheDocument();
    expect(screen.getByText('From raw data to rich insights. See your trips like never before.')).toBeInTheDocument();
    expect(screen.getByText((content, element) => content.startsWith('Drag & drop your'))).toBeInTheDocument();
  });

  it('should display the processing state', () => {
    render(<LandingPage {...mockProps} isProcessing={true} />);
    expect(screen.getByText('Processing your data...')).toBeInTheDocument();
    expect(screen.queryByText('Drag & drop your trips_data-0.csv file here')).not.toBeInTheDocument();
  });

  it('should display an error message', () => {
    render(<LandingPage {...mockProps} error="Test Error" />);
    expect(screen.getByText('Analysis Failed')).toBeInTheDocument();
    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });

  it('should change style when dragging', () => {
    const { container } = render(<LandingPage {...mockProps} isDragging={true} />);
    const dropZone = container.querySelector('.border-2');
    expect(dropZone).toHaveClass('border-purple-500');
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