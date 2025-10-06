import { ThemeProvider } from "@/components/ThemeProvider";
import { useState } from 'react';
import './App.css';
import 'leaflet/dist/leaflet.css';
import { useTripData } from './hooks/useTripData';
import { CSVRow } from './services/csvParser';
import { downloadKML } from './services/kmlService';
import { KM_PER_MILE } from './constants';
import InitialView from './components/organisms/InitialView';
import { Spinner } from '@/components/ui/spinner';
import Header from './components/organisms/Header';
import SettingsSheet from './components/organisms/SettingsSheet';
import { useFileHandler } from './hooks/useFileHandler';
import MainView from './components/organisms/MainView';
import LandingPage from './components/organisms/LandingPage';

export type DistanceUnit = 'miles' | 'km';

function App() {
  const {
    rows,
    error,
    isProcessing,
    isDragging,
    handleFileSelect,
    handleDrop,
    handleDragEvents,
    resetState: resetFileHandlerState,
  } = useFileHandler();

  const [focusedTrip, setFocusedTrip] = useState<CSVRow | null>(null);
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('miles');
  const [sidebarView, setSidebarView] = useState<'stats' | 'tripList'>('stats');
  const [tripList, setTripList] = useState<CSVRow[]>([]);
  const [tripListTitle, setTripListTitle] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [tripData, isAnalyzing] = useTripData(rows, distanceUnit);

  const convertDistance = (miles: number): number => {
    return distanceUnit === 'km' ? miles * KM_PER_MILE : miles;
  };

  const resetMap = () => {
    resetFileHandlerState();
    setFocusedTrip(null);
    setSidebarView('stats');
  };

  const handleFocusOnTrip = (tripRow: CSVRow) => {
    setFocusedTrip(tripRow);
  };

  const handleShowAll = () => {
    setFocusedTrip(null);
  };

  const handleShowTripList = (type: string) => {
    if (rows.length === 0) return;

    let list: CSVRow[] = [];
    let title = '';

    switch (type) {
      case 'all':
        list = rows;
        title = `All Trip Requests (${rows.length})`;
        break;
      case 'successful':
        list = rows.filter(r => r.status?.toLowerCase() === 'completed');
        title = `Successful Trips (${list.length})`;
        break;
      case 'canceled':
        list = rows.filter(r => ['rider_canceled', 'driver_canceled'].includes(r.status?.toLowerCase() || ''));
        title = `Canceled Trips (${list.length})`;
        break;
      case 'rider_canceled':
        list = rows.filter(r => r.status?.toLowerCase() === 'rider_canceled');
        title = `Rider Canceled Trips (${list.length})`;
        break;
      case 'driver_canceled':
        list = rows.filter(r => r.status?.toLowerCase() === 'driver_canceled');
        title = `Driver Canceled Trips (${list.length})`;
        break;
      case 'unfulfilled': {
        const knownStatuses = ['completed', 'rider_canceled', 'driver_canceled'];
        list = rows.filter(r => !knownStatuses.includes(r.status?.toLowerCase() || ''));
        title = `Unfulfilled Trips (${list.length})`;
        break;
      }
      default: return;
    }
    setTripList(list);
    setTripListTitle(title);
    setSidebarView('tripList');
  };

  const actionsEnabled = rows.length > 0 && !isProcessing;

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const showSpinner = isProcessing || isAnalyzing;

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {showSpinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Spinner />
        </div>
      )}
      <Header
        onReset={resetMap}
        actionsEnabled={actionsEnabled}
        error={error}
        toggleSettings={toggleSettings}
        rows={rows}
      />
      <SettingsSheet
        unit={distanceUnit}
        setUnit={setDistanceUnit}
        isMenuOpen={isSettingsOpen}
        toggleMenu={toggleSettings}
      />

      {rows.length === 0 ? (
        <LandingPage
          onFileSelect={handleFileSelect}
          isProcessing={showSpinner}
          error={error}
          isDragging={isDragging}
          onDragEvents={handleDragEvents}
          onDrop={handleDrop}
        />
      ) : (
        <MainView
          rows={rows}
          focusedTrip={focusedTrip}
          distanceUnit={distanceUnit}
          convertDistance={convertDistance}
          tripData={tripData}
          sidebarView={sidebarView}
          error={error}
          isProcessing={showSpinner}
          tripList={tripList}
          tripListTitle={tripListTitle}
          onShowAll={handleShowAll}
          onFocusOnTrip={handleFocusOnTrip}
          onShowTripList={handleShowTripList}
          onFileSelect={handleFileSelect}
          onBackToStats={() => setSidebarView('stats')}
        />
      )}
    </ThemeProvider>
  );
}

export default App;
