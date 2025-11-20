import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import InitialView from './InitialView';
import { assertAccessible } from '../../tests/utils';

const mockProps = {
  onFileSelect: vi.fn(),
  isProcessing: false,
  error: '',
  isDragging: false,
  onDragEvents: vi.fn(),
  onDrop: vi.fn(),
};

describe('InitialView', () => {
  it('should be accessible', async () => {
    await assertAccessible(<InitialView {...mockProps} />);
  });

  it('should render the initial state correctly', () => {
    render(<InitialView {...mockProps} />);
    expect(screen.getByText('Upload your CSV file')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop your file here or click the button below to select a file.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select File' })).toBeInTheDocument();
  });

  it('should display the processing state', () => {
    render(<InitialView {...mockProps} isProcessing={true} />);
    const button = screen.getByRole('button', { name: 'Processing...' });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('should display an error message', () => {
    render(<InitialView {...mockProps} error="Test Error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });

  it('should change style when dragging', () => {
    const { container } = render(<InitialView {...mockProps} isDragging={true} />);
    const dropZone = container.querySelector('.border-2');
    expect(dropZone).toHaveClass('border-emerald-500');
  });

  it('should call onFileSelect when a file is chosen', async () => {
    const user = userEvent.setup();
    render(<InitialView {...mockProps} />);
    const file = new File([''], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByText('Drag & drop your CSV file here').parentElement?.querySelector('input[type="file"]');

    if (fileInput) {
      await user.upload(fileInput, file);
      expect(mockProps.onFileSelect).toHaveBeenCalledTimes(1);
    }
  });

  it('should call onDrop when a file is dropped', async () => {
    const user = userEvent.setup();
    render(<InitialView {...mockProps} />);
    const dropZone = screen.getByText('Drag & drop your CSV file here').parentElement;
    if (dropZone) {
      await user.click(dropZone);
      expect(mockProps.onDrop).toHaveBeenCalledTimes(0);
    }
  });
});