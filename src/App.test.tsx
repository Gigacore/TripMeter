import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import * as useFileHandler from '@/hooks/useFileHandler';
import * as useTripData from '@/hooks/useTripData';
import Header from '@/components/organisms/Header';

// Mock hooks and components
vi.mock('@/hooks/useFileHandler');
vi.mock('@/hooks/useTripData');
vi.mock('@/components/organisms/Header');
vi.mock('@/components/organisms/LandingPage', () => ({ default: (props: any) => <div data-testid="landing-page" {...props} /> }));
vi.mock('@/components/organisms/MainView', () => ({ default: ({ rows, focusedTrip, distanceUnit, convertDistance, tripData, sidebarView, error, isProcessing, tripList, tripListTitle, onShowAll, onFocusOnTrip, onShowTripList, onFileSelect, onBackToStats }: any) => <div data-testid="main-view" {...{ rows, focusedTrip, distanceUnit, convertDistance, tripData, sidebarView, error, isProcessing, tripList, tripListTitle, onShowAll, onFocusOnTrip, onShowTripList, onFileSelect, onBackToStats }} /> }));
vi.mock('@/components/organisms/SettingsSheet', () => ({ default: (props: any) => <div data-testid="settings-sheet" role="status" aria-hidden={!props.isMenuOpen} /> }));
vi.mock('@/components/ui/spinner', () => ({ Spinner: () => <div data-testid="spinner" /> }));

const useFileHandlerMock = useFileHandler.useFileHandler as vi.Mock;
const useTripDataMock = useTripData.useTripData as vi.Mock;
const HeaderMock = Header as vi.Mock;

const defaultFileHandlerState = {
  rows: [],
  error: '',
  isProcessing: false,
  isDragging: false,
  handleFileSelect: vi.fn(),
  handleDrop: vi.fn(),
  handleDragEvents: vi.fn(),
  resetState: vi.fn(),
};

const defaultTripDataState: [any, boolean] = [
  null,
  false, // isAnalyzing
];

describe('TripMeter App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render LandingPage when there are no rows', () => {
    useFileHandlerMock.mockReturnValue({ ...defaultFileHandlerState, rows: [] });
    useTripDataMock.mockReturnValue(defaultTripDataState);
    render(<App />);
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    expect(screen.queryByTestId('main-view')).not.toBeInTheDocument();
  });

  it('should render MainView when there are rows', async () => {
    useFileHandlerMock.mockReturnValue({ ...defaultFileHandlerState, rows: [{ id: 1 }] });
    useTripDataMock.mockReturnValue([{ totalTrips: 1 }, false]);
    render(<App />);
    await act(async () => {
      expect(await screen.findByTestId('main-view')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('landing-page')).not.toBeInTheDocument();
  });

  it('should show the spinner when processing', () => {
    useFileHandlerMock.mockReturnValue({ ...defaultFileHandlerState, isProcessing: true });
    useTripDataMock.mockReturnValue(defaultTripDataState);
    render(<App />);
    const spinners = screen.getAllByTestId('spinner');
    expect(spinners.length).toBeGreaterThan(0);
  });

  it('should show the spinner when analyzing', () => {
    useFileHandlerMock.mockReturnValue(defaultFileHandlerState);
    useTripDataMock.mockReturnValue([null, true]);
    render(<App />);
    const spinners = screen.getAllByTestId('spinner');
    expect(spinners.length).toBeGreaterThan(0);
  });

  it('should toggle the settings sheet', async () => {
    useFileHandlerMock.mockReturnValue(defaultFileHandlerState);
    useTripDataMock.mockReturnValue(defaultTripDataState);

    render(<App />);

    const headerProps = HeaderMock.mock.calls[0][0];
    const settingsSheet = screen.getByTestId('settings-sheet');
    expect(settingsSheet).toHaveAttribute('aria-hidden', 'true');

    act(() => {
      headerProps.toggleSettings();
    });

    expect(settingsSheet).toHaveAttribute('aria-hidden', 'false');
  });

  it('should reset the state when onReset is called from Header', async () => {
    const resetState = vi.fn();
    useFileHandlerMock.mockReturnValue({ ...defaultFileHandlerState, rows: [{ id: 1 }], resetState });
    useTripDataMock.mockReturnValue(defaultTripDataState);

    render(<App />);

    const headerProps = HeaderMock.mock.calls[0][0];

    act(() => {
      headerProps.onReset();
    });

    expect(resetState).toHaveBeenCalled();
  });
});