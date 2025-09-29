import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import './App.css';
import 'leaflet/dist/leaflet.css';
import { useTripData } from './hooks/useTripData';
import { parseCSV, CSVRow } from './services/csvParser';
import { downloadKML } from './services/kmlService';
import { normalizeHeaders } from './utils/csv';
import { KM_PER_MILE } from './constants';
import Header from './components/organisms/Header';
import InitialView from './components/organisms/InitialView';
import Sidebar from './components/organisms/Sidebar';
import Map from './components/organisms/Map';
import Spinner from './components/atoms/Spinner';
import TopStats from './components/organisms/TopStats';
import Settings from './components/organisms/Settings';

export type DistanceUnit = 'miles' | 'km';

function App() {
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [focusedTrip, setFocusedTrip] = useState<CSVRow | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('miles');
  const [sidebarView, setSidebarView] = useState<'stats' | 'tripList'>('stats');
  const [tripList, setTripList] = useState<CSVRow[]>([]);
  const [tripListTitle, setTripListTitle] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tripData = useTripData(rows, distanceUnit);

  const convertDistance = (miles: number): number => {
    return distanceUnit === 'km' ? miles * KM_PER_MILE : miles;
  };

  const showError = (msg: string) => setError(msg);
  const clearError = () => setError('');

  const resetMap = () => {
    setRows([]);
    setError('');
    setFocusedTrip(null);
    setSidebarView('stats');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFile = async (file?: File) => {
    resetMap();
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      showError('Please select a .csv file.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await parseCSV(file);
      if (!result || !result.meta || !result.data) {
        throw new Error('Failed to parse CSV.');
      }

      const idxMap = normalizeHeaders(result.meta.fields || []);
      if (!idxMap) {
        showError('Missing required headers. Expected: begintrip_lat, begintrip_lng, dropoff_lat, dropoff_lng (case-insensitive).');
        setIsProcessing(false);
        return;
      }

      const normalizedRows = result.data.map(obj => {
        const out: CSVRow = {};
        for (const k in obj) {
          if (Object.hasOwn(obj, k)) {
            out[k.trim().toLowerCase()] = obj[k];
          }
        }
        return out;
      });

      setRows(normalizedRows);
      clearError();
    } catch (e) {
      console.error(e);
      showError('Unable to read this CSV. Please check formatting.');
      setRows([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    handleFile(f);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    handleFile(f);
  };

  const handleDragEvents = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
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
        list = rows.filter(r => r.status?.toLowerCase() === 'rider_canceled' || r.status?.toLowerCase() === 'driver_canceled');
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

  return (
    <>
      {isProcessing && <Spinner />}
      <Header
        onReset={resetMap}
        actionsEnabled={actionsEnabled}
        error={error}
        toggleSettings={toggleSettings}
      />
      <Settings
        unit={distanceUnit}
        setUnit={setDistanceUnit}
        downloadKml={() => downloadKML(rows)}
        isMenuOpen={isSettingsOpen}
        toggleMenu={toggleSettings}
      />

      {rows.length === 0 ? (
        <InitialView
          onFileSelect={handleFileSelect}
          isProcessing={isProcessing}
          error={error}
          isDragging={isDragging}
          onDragEvents={handleDragEvents}
          onDrop={handleDrop}
        />
      ) : (
        <div className="main-content">
          <div className="map-and-stats-container">
            <Map
              rows={rows}
              focusedTrip={focusedTrip}
              distanceUnit={distanceUnit}
              convertDistance={convertDistance}
            />
            <TopStats tripData={tripData} distanceUnit={distanceUnit} />
          </div>
          <div className="container">
            <Sidebar
              focusedTrip={focusedTrip}
              onShowAll={handleShowAll}
              convertDistance={convertDistance}
              distanceUnit={distanceUnit}
              sidebarView={sidebarView}
              error={error}
              tripData={tripData}
              onFocusOnTrip={handleFocusOnTrip}
              onShowTripList={handleShowTripList}
              onFileSelect={handleFileSelect}
              isProcessing={isProcessing}
              rows={rows}
              tripList={tripList}
              tripListTitle={tripListTitle}
              onBackToStats={() => setSidebarView('stats')}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
