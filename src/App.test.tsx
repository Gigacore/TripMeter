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
vi.mock('@/components/organisms/InitialView', () => ({ default: ({ onFileSelect, isProcessing, error, isDragging, onDragEvents, onDrop }: any) => <div data-testid="initial-view" {...{ onFileSelect, isProcessing, error, isDragging, onDragEvents, onDrop }} /> }));
vi.mock('@/components/organisms/MainView', () => ({ default: ({ rows, focusedTrip, distanceUnit, convertDistance, tripData, sidebarView, error, isProcessing, tripList, tripListTitle, onShowAll, onFocusOnTrip, onShowTripList, onFileSelect, onBackToStats }: any) => <div data-testid="main-view" {...{ rows, focusedTrip, distanceUnit, convertDistance, tripData, sidebarView, error, isProcessing, tripList, tripListTitle, onShowAll, onFocusOnTrip, onShowTripList, onFileSelect, onBackToStats }} /> }));
vi.mock('@/components/organisms/SettingsSheet', () => ({ default: (props: any) => <div data-testid="settings-sheet" role="status" aria-hidden={!props.isMenuOpen} /> }));
vi.mock('@/components/atoms/Spinner', () => ({ default: () => <div data-testid="spinner" /> }));

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
  { /* mock trip data */ },
  false, // isAnalyzing
];

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render InitialView when there are no rows', () => {
    useFileHandlerMock.mockReturnValue(defaultFileHandlerState);
    useTripDataMock.mockReturnValue(defaultTripDataState);
    render(<App />);
    expect(screen.getByTestId('initial-view')).toBeInTheDocument();
    expect(screen.queryByTestId('main-view')).not.toBeInTheDocument();
  });

  it('should render MainView when there are rows', () => {
    useFileHandlerMock.mockReturnValue({ ...defaultFileHandlerState, rows: [{ id: 1 }] });
    useTripDataMock.mockReturnValue(defaultTripDataState);
    render(<App />);
    expect(screen.getByTestId('main-view')).toBeInTheDocument();
    expect(screen.queryByTestId('initial-view')).not.toBeInTheDocument();
  });

  it('should show the spinner when processing', () => {
    useFileHandlerMock.mockReturnValue({ ...defaultFileHandlerState, isProcessing: true });
    useTripDataMock.mockReturnValue(defaultTripDataState);
    render(<App />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('should show the spinner when analyzing', () => {
    useFileHandlerMock.mockReturnValue(defaultFileHandlerState);
    useTripDataMock.mockReturnValue([null, true]);
    render(<App />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
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