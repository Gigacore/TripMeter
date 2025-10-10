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
import MapModal from './components/organisms/charts/MapModal';
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
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);
  const [mapModalRows, setMapModalRows] = useState<CSVRow[]>([]);
  const [mapModalTitle, setMapModalTitle] = useState<string>('');

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

  const handleFocusOnTrips = (tripRows: CSVRow[], title?: string) => {
    setMapModalRows(tripRows);
    setMapModalTitle(
      title ||
        `Found ${tripRows.length} trip${tripRows.length > 1 ? 's' : ''}`
    );
    setIsMapModalOpen(true);
  };

  const handleShowAll = () => {
    setFocusedTrip(null);
  };

  const handleShowTripList = (type: string, trips?: CSVRow[]) => {
    if (rows.length === 0) return;

    let list: CSVRow[] = [];
    let title = '';

    if (type.startsWith('single-trip-map:')) {
      const tripId = type.split(':')[1];
      const trip = rows.find(r => r['Request id'] === tripId);
      if (trip) {
        setMapModalRows([trip]);
        setMapModalTitle('Trip Details');
        setIsMapModalOpen(true);
      }
      return;
    }


    switch (type) {
      case 'all-map':
        setMapModalRows(rows);
        setMapModalTitle(`All Trip Requests (${rows.length})`);
        setIsMapModalOpen(true);
        return;
      case 'successful-map':
        list = rows.filter(r => r.status?.toLowerCase() === 'completed');
        setMapModalRows(list);
        setMapModalTitle(`Successful Trips (${list.length})`);
        setIsMapModalOpen(true);
        return;
      case 'rider_canceled-map':
        list = rows.filter(r => r.status?.toLowerCase() === 'rider_canceled');
        setMapModalRows(list);
        setMapModalTitle(`Rider Canceled Trips (${list.length})`);
        setIsMapModalOpen(true);
        return;
      case 'driver_canceled-map':
        list = rows.filter(r => r.status?.toLowerCase() === 'driver_canceled');
        setMapModalRows(list);
        setMapModalTitle(`Driver Canceled Trips (${list.length})`);
        setIsMapModalOpen(true);
        return;
      case 'unfulfilled-map': {
        const knownStatuses = ['completed', 'rider_canceled', 'driver_canceled'];
        list = rows.filter(r => !knownStatuses.includes(r.status?.toLowerCase() || ''));
        setMapModalRows(list);
        setMapModalTitle(`Unfulfilled Trips (${list.length})`);
        setIsMapModalOpen(true);
        return;
      }
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

      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        rows={mapModalRows}
        title={mapModalTitle}
        distanceUnit={distanceUnit}
        convertDistance={convertDistance}
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
          onFocusOnTrips={handleFocusOnTrips}
          onShowTripList={handleShowTripList}
          onFileSelect={handleFileSelect}
          onBackToStats={() => setSidebarView('stats')}
        />
      )}
    </ThemeProvider>
  );
}

export default App;
