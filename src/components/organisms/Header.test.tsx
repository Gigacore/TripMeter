import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Header from './Header';
import * as kmlService from '@/services/kmlService';
import { assertAccessible } from '../../tests/utils';

vi.mock('../molecules/ModeToggle', () => ({
  ModeToggle: () => <div data-testid="mode-toggle"></div>,
}));

vi.mock('@/services/kmlService', () => ({
  downloadKML: vi.fn(),
}));

const mockProps = {
  onReset: vi.fn(),
  actionsEnabled: true,
  error: '',
  toggleSettings: vi.fn(),
  rows: [{ id: 1 }],
};

describe('Header', () => {
  it('should be accessible', async () => {
    await assertAccessible(<Header {...mockProps} />);
  });

  it('should render the header title', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText('TripMeter')).toBeInTheDocument();
  });

  it('should render the settings and mode toggle buttons', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByTestId('mode-toggle')).toBeInTheDocument();
  });

  it('should render the download and clear buttons when actions are enabled', () => {
    render(<Header {...mockProps} actionsEnabled={true} />);
    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(screen.getByText('Clear Data')).toBeInTheDocument();
  });

  it('should not render the download and clear buttons when actions are disabled', () => {
    render(<Header {...mockProps} actionsEnabled={false} />);
    expect(screen.queryByText('Download')).not.toBeInTheDocument();
    expect(screen.queryByText('Clear Data')).not.toBeInTheDocument();
  });

  it('should call toggleSettings when the settings button is clicked', async () => {
    const user = userEvent.setup();
    render(<Header {...mockProps} />);
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(mockProps.toggleSettings).toHaveBeenCalledTimes(1);
  });

  it('should call onReset when the clear data button is clicked', async () => {
    const user = userEvent.setup();
    render(<Header {...mockProps} />);
    await user.click(screen.getByRole('button', { name: 'Clear Data' }));
    expect(mockProps.onReset).toHaveBeenCalledTimes(1);
  });

  it('should call downloadKML with "both" when "Download KML (Combined)" is clicked', async () => {
    const user = userEvent.setup();
    render(<Header {...mockProps} />);
    await user.click(screen.getByRole('button', { name: 'Download' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Download KML (Combined)' }));
    expect(kmlService.downloadKML).toHaveBeenCalledWith(mockProps.rows, 'both');
  });

  it('should call downloadKML with "begin" when "Download KML (Pickups)" is clicked', async () => {
    const user = userEvent.setup();
    render(<Header {...mockProps} />);
    await user.click(screen.getByRole('button', { name: 'Download' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Download KML (Pickups)' }));
    expect(kmlService.downloadKML).toHaveBeenCalledWith(mockProps.rows, 'begin');
  });

  it('should call downloadKML with "drop" when "Download KML (Dropoffs)" is clicked', async () => {
    const user = userEvent.setup();
    render(<Header {...mockProps} />);
    await user.click(screen.getByRole('button', { name: 'Download' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Download KML (Dropoffs)' }));
    expect(kmlService.downloadKML).toHaveBeenCalledWith(mockProps.rows, 'drop');
  });
});