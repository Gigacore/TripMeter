import { useState, useRef } from 'react';
import './App.css';
import 'leaflet/dist/leaflet.css';
import { useTripData } from './hooks/useTripData';
import { parseCSV } from './services/csvParser';
import { normalizeHeaders } from './utils/csv';
import { KM_PER_MILE } from './constants';
import Header from './components/organisms/Header';
import InitialView from './components/organisms/InitialView';
import Sidebar from './components/organisms/Sidebar';
import Map from './components/organisms/Map';
import Spinner from './components/atoms/Spinner';

function App() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [focusedTrip, setFocusedTrip] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [distanceUnit, setDistanceUnit] = useState('miles'); // 'miles' or 'km'
  const [layout, setLayout] = useState('split'); // 'split', 'map', 'sidebar'
  const [sidebarView, setSidebarView] = useState('stats'); // 'stats' or 'tripList'
  const [tripList, setTripList] = useState([]);
  const [tripListTitle, setTripListTitle] = useState('');
  const fileInputRef = useRef(null);

  const tripData = useTripData(rows, distanceUnit);

  const convertDistance = (miles) => {
    return distanceUnit === 'km' ? miles * KM_PER_MILE : miles;
  };

  const showError = (msg) => setError(msg);
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

  const handleFile = async (file) => {
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
        const out = {};
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

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    handleFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    handleFile(f);
  };

  const handleDragEvents = (e) => {
    e.preventDefault();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleFocusOnTrip = (tripRow) => {
    setFocusedTrip(tripRow);
  };

  const handleShowAll = () => {
    setFocusedTrip(null);
  };

  const handleShowTripList = (type) => {
    if (rows.length === 0) return;

    let list = [];
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
      case 'unfulfilled':
        const knownStatuses = ['completed', 'rider_canceled', 'driver_canceled'];
        list = rows.filter(r => !knownStatuses.includes(r.status?.toLowerCase()));
        title = `Unfulfilled Trips (${list.length})`;
        break;
      default: return;
    }
    setTripList(list);
    setTripListTitle(title);
    setSidebarView('tripList');
  };

  const actionsEnabled = rows.length > 0 && !isProcessing;

  return (
    <>
      {isProcessing && <Spinner />}
      <Header
        layout={layout}
        onLayoutChange={setLayout}
        distanceUnit={distanceUnit}
        onDistanceUnitChange={setDistanceUnit}
        onReset={resetMap}
        actionsEnabled={actionsEnabled}
        error={error}
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
        <div className={`container layout-${layout}`}>
          <Sidebar
            layout={layout}
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
          <Map
            rows={rows}
            focusedTrip={focusedTrip}
            layout={layout}
            distanceUnit={distanceUnit}
            convertDistance={convertDistance}
          />
        </div>
      )}
    </>
  );
}

export default App;