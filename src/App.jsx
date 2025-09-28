import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import Papa from 'papaparse';
import './App.css';
import 'leaflet/dist/leaflet.css';

// --- Leaflet Icon Setup ---
// It's better to have these outside the component to avoid re-creation on re-renders.
const greenIcon = L.icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -28]
});

const redIcon = L.icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -28]
});

const Stat = ({ label, value, onClick, unit, unitClassName }) => (
  <div className={`stat ${onClick ? 'clickable' : ''}`} onClick={onClick}>
    <div>{label}</div>
    <div className="stat-value">
      {value}
      {unit && <span className={`stat-unit ${unitClassName || ''}`}>{unit}</span>}
    </div>
  </div>
);

const Spinner = () => (
  <div className="spinner-overlay">
    <div className="spinner"></div>
  </div>
);

function App() {
  // --- State ---
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [beginCount, setBeginCount] = useState(0);
  const [dropoffCount, setDropoffCount] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [longestTrip, setLongestTrip] = useState(0);
  const [longestTripByDist, setLongestTripByDist] = useState(0);
  const [shortestTrip, setShortestTrip] = useState(0);
  const [shortestTripByDist, setShortestTripByDist] = useState(0);
  const [longestTripRow, setLongestTripRow] = useState(null);
  const [totalWaitingTime, setTotalWaitingTime] = useState(0);
  const [avgWaitingTime, setAvgWaitingTime] = useState(0);
  const [shortestWaitingTime, setShortestWaitingTime] = useState(0);
  const [longestWaitingTime, setLongestWaitingTime] = useState(0);
  const [shortestWaitingTimeRow, setShortestWaitingTimeRow] = useState(null);
  const [longestWaitingTimeRow, setLongestWaitingTimeRow] = useState(null);
  const [fastestTripBySpeed, setFastestTripBySpeed] = useState(0);
  const [fastestTripBySpeedRow, setFastestTripBySpeedRow] = useState(null);
  const [slowestTripBySpeed, setSlowestTripBySpeed] = useState(0);
  const [slowestTripBySpeedRow, setSlowestTripBySpeedRow] = useState(null);
  const [longestTripByDistRow, setLongestTripByDistRow] = useState(null);
  const [shortestTripRow, setShortestTripRow] = useState(null);
  const [shortestTripByDistRow, setShortestTripByDistRow] = useState(null);
  const [avgTripDuration, setAvgTripDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalTripDuration, setTotalTripDuration] = useState(0);
  const [focusedTrip, setFocusedTrip] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [distanceUnit, setDistanceUnit] = useState('miles'); // 'miles' or 'km'

  const [totalCompletedDistance, setTotalCompletedDistance] = useState(0);
  const [layout, setLayout] = useState('split'); // 'split', 'map', 'sidebar'
  const [totalTrips, setTotalTrips] = useState(0);
  const [successfulTrips, setSuccessfulTrips] = useState(0);
  const [riderCanceledTrips, setRiderCanceledTrips] = useState(0);
  const [driverCanceledTrips, setDriverCanceledTrips] = useState(0);
  const [unfulfilledTrips, setUnfulfilledTrips] = useState(0);
  // --- Refs for Leaflet objects and file input ---
  const [avgFareByCurrency, setAvgFareByCurrency] = useState({});
  const [lowestFareByCurrency, setLowestFareByCurrency] = useState({});
  const [highestFareByCurrency, setHighestFareByCurrency] = useState({});
  const [totalFareByCurrency, setTotalFareByCurrency] = useState({});
  const [sidebarView, setSidebarView] = useState('stats'); // 'stats' or 'tripList'
  const [tripList, setTripList] = useState([]);
  const [costPerDistanceByCurrency, setCostPerDistanceByCurrency] = useState({});
  const [costPerDurationByCurrency, setCostPerDurationByCurrency] = useState({});
  const [tripListTitle, setTripListTitle] = useState('');
  const mapRef = useRef(null);
  const beginLayerRef = useRef(null);
  const dropLayerRef = useRef(null);
  const heatLayerRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- Constants ---
  const KM_PER_MILE = 1.60934;

  const convertDistance = (miles) => {
    return distanceUnit === 'km' ? miles * KM_PER_MILE : miles;
  };
  // --- Helper Functions ---
  const formatDuration = (totalMinutes, includeSeconds = false) => {
    if (totalMinutes < 0) return 'N/A';
    if (totalMinutes === 0) return '0 minutes';
  
    const MIN_PER_YEAR = 365.25 * 24 * 60;
    const MIN_PER_MONTH = 30.44 * 24 * 60;
    const MIN_PER_DAY = 24 * 60;
    const MIN_PER_HOUR = 60;
  
    let remainingMinutes = totalMinutes;
  
    const years = Math.floor(remainingMinutes / MIN_PER_YEAR);
    remainingMinutes %= MIN_PER_YEAR;
    const months = Math.floor(remainingMinutes / MIN_PER_MONTH);
    remainingMinutes %= MIN_PER_MONTH;
    const days = Math.floor(remainingMinutes / MIN_PER_DAY);
    remainingMinutes %= MIN_PER_DAY;
    const hours = Math.floor(remainingMinutes / MIN_PER_HOUR);
    remainingMinutes %= MIN_PER_HOUR;
    const minutes = Math.floor(remainingMinutes);
    const seconds = includeSeconds ? Math.floor((remainingMinutes - minutes) * 60) : 0;
  
    const parts = [
      years > 0 && `${years}y`,
      months > 0 && `${months}mo`,
      days > 0 && `${days}d`,
      hours > 0 && `${hours}h`,
      minutes > 0 && `${minutes}min`,
      seconds > 0 && `${seconds}s`
    ].filter(Boolean);
  
    return parts.length > 0 ? parts.join(' ') : '0min';
  };

  const formatDurationWithSeconds = (totalMinutes) => {
    if (totalMinutes < 0) return 'N/A';
    if (totalMinutes === 0) return '0 seconds';

    if (totalMinutes < 1) {
      const seconds = Math.round(totalMinutes * 60);
      return `${seconds}s`;
    }

    return formatDuration(totalMinutes, true);
  }

  const toNumber = (x) => {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  };

  const normalizeHeaders = (hdrs) => {
    const idx = {};
    hdrs.forEach((h, i) => idx[h.trim().toLowerCase()] = i);
    const req = ['begintrip_lat', 'begintrip_lng', 'dropoff_lat', 'dropoff_lng'];
    for (const k of req) {
      if (!(k in idx)) return null;
    }
    return idx; // Not used in the new implementation but keeping the logic for validation
  };

  const showError = (msg) => setError(msg);
  const clearError = () => setError('');

  const fitToLayers = () => {
    if (beginLayerRef.current && dropLayerRef.current) {
      const group = L.featureGroup([beginLayerRef.current, dropLayerRef.current]);
      try {
        const b = group.getBounds();
        if (b.isValid()) {
          mapRef.current.fitBounds(b.pad(0.1));
        }
      } catch {
        // This can happen if there are no layers, which is fine.
      }
    }
  };

  const resetMap = () => {
    beginLayerRef.current?.clearLayers();
    dropLayerRef.current?.clearLayers();
    heatLayerRef.current?.setLatLngs([]);
    setRows([]);
    setBeginCount(0);
    setDropoffCount(0);
    setAvgSpeed(0);
    setLongestTrip(0);
    setLongestTripByDist(0);
    setShortestTrip(0);
    setShortestTripByDist(0);
    setLongestTripRow(null);
    setTotalWaitingTime(0);
    setAvgWaitingTime(0);
    setShortestWaitingTime(0);
    setLongestWaitingTime(0);
    setShortestWaitingTimeRow(null);
    setLongestWaitingTimeRow(null);
    setFastestTripBySpeed(0);
    setFastestTripBySpeedRow(null);
    setSlowestTripBySpeed(0);
    setSlowestTripBySpeedRow(null);
    setLongestTripByDistRow(null);
    setShortestTripRow(null);
    setShortestTripByDistRow(null);
    setAvgTripDuration(0);
    setFocusedTrip(null);
    setTotalTripDuration(0);
    setTotalTrips(0);
    setSuccessfulTrips(0);    
    setRiderCanceledTrips(0);
    setDriverCanceledTrips(0);
    setUnfulfilledTrips(0);
    setTotalCompletedDistance(0);
    setAvgFareByCurrency({});
    setLowestFareByCurrency({});
    setHighestFareByCurrency({});
    setTotalFareByCurrency({});
    setCostPerDistanceByCurrency({});
    setCostPerDurationByCurrency({});
    setSidebarView('stats');
    clearError();
    fileInputRef.current.value = ''; // Clear file input
    if (mapRef.current) {
      mapRef.current.setView([20, 0], 2);
    }
  };

  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: results => resolve(results),
        error: err => reject(err)
      });
    });
  };

  const buildKML = (parts) => {
    const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const style = (id, href) => `\n  <Style id="${id}">\n    <IconStyle>\n      <scale>1.1</scale>\n      <Icon><href>${href}</href></Icon>\n    </IconStyle>\n  </Style>`;
    const items = parts.map(p => `\n  <Placemark>\n    <name>${esc(p.name)}</name>\n    ${p.styleUrl ? `<styleUrl>#${p.styleUrl}</styleUrl>` : ''}\n    ${p.desc ? `<description>${esc(p.desc)}</description>` : ''}\n    <Point><coordinates>${p.coords[0]},${p.coords[1]},0</coordinates></Point>\n  </Placemark>`).join('');
    const kml = `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n  <name>Trips (Begin/Dropoff)</name>`
      + style('beginStyle','https://maps.google.com/mapfiles/ms/icons/green-dot.png')
      + style('dropStyle','https://maps.google.com/mapfiles/ms/icons/red-dot.png')
      + items + '\n</Document>\n</kml>';
    return kml;
  };

  const download = (filename, text) => {
    const blob = new Blob([text], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
  };

  const makeParts = ({ which = 'both' } = {}) => {
    const parts = [];
    rows.forEach((r, idx) => {
      const rowNo = idx + 1;
      if (which === 'both' || which === 'begin') {
        const lat = toNumber(r.begintrip_lat), lng = toNumber(r.begintrip_lng);
        if (lat != null && lng != null) {
          parts.push({ name: `Begintrip #${rowNo}`, styleUrl: 'beginStyle', coords: [lng, lat] });
        }
      }
      if (which === 'both' || which === 'drop') {
        const lat = toNumber(r.dropoff_lat), lng = toNumber(r.dropoff_lng);
        if (lat != null && lng != null) {
          parts.push({ name: `Dropoff #${rowNo}`, styleUrl: 'dropStyle', coords: [lng, lat] });
        }
      }
    });
    return parts;
  };

  // --- Event Handlers ---
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

  const handleDownloadKML = (which) => {
      const parts = makeParts({ which });
      const kml = buildKML(parts);
      download(`trips_${which}.kml`, kml);
  };

  const handleFocusOnTrip = (tripRow) => {
    if (!tripRow || !mapRef.current) return;

    const blt = toNumber(tripRow.begintrip_lat);
    const bln = toNumber(tripRow.begintrip_lng);
    const dlt = toNumber(tripRow.dropoff_lat);
    const dln = toNumber(tripRow.dropoff_lng);

    if (blt != null && bln != null && dlt != null && dln != null) {
      const bounds = L.latLngBounds([[blt, bln], [dlt, dln]]);
      mapRef.current.fitBounds(bounds.pad(0.2));
      setFocusedTrip(tripRow);
    }
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
  // --- Effects ---
  // Initialize map
  useEffect(() => {
    if (rows.length > 0 && !mapRef.current) {
      const map = L.map('map');
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapRef.current = map;
      beginLayerRef.current = L.layerGroup().addTo(map);
      dropLayerRef.current = L.layerGroup().addTo(map);
      heatLayerRef.current = L.heatLayer([], { radius: 25 }).addTo(map);


      L.control.layers(null, {
        'Begintrip (green)': beginLayerRef.current,
        'Dropoff (red)': dropLayerRef.current,
        'Heatmap': heatLayerRef.current
      }).addTo(map);

      map.setView([20, 0], 2);
    }
  }, [rows]);

  // Invalidate map size when layout changes
  useEffect(() => {
    if (mapRef.current) {
      // Use a short timeout to allow the CSS transition to start.
      const timer = setTimeout(() => {
        mapRef.current.invalidateSize({ pan: false });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [layout]);
  const handleShowAll = () => {
    setFocusedTrip(null);
    fitToLayers();
  };

  // Render markers when rows change
  useEffect(() => {
    if (!mapRef.current) return;

    beginLayerRef.current?.clearLayers();
    dropLayerRef.current?.clearLayers();
    heatLayerRef.current?.setLatLngs([]);

    let bCount = 0, dCount = 0;
    const heatPoints = [];

    const tripsToRender = focusedTrip ? [focusedTrip] : rows;

    const createPopupContent = (pointType, data) => {
      const {
        city,
        product_type,
        status,
        request_time,
        begin_trip_time,
        begintrip_address,
        dropoff_time,
        dropoff_address,
        distance,
        fare_amount,
        fare_currency,
        begintrip_lat,
        begintrip_lng,
        dropoff_lat,
        dropoff_lng
      } = data;

      const lat = pointType === 'begin' ? begintrip_lat : dropoff_lat;
      const lng = pointType === 'begin' ? begintrip_lng : dropoff_lng;
      const address = pointType === 'begin' ? begintrip_address : dropoff_address;
      let speedContent = '';
      let waitingTimeContent = '';
      
      const tripDistanceMiles = parseFloat(distance);
      const displayDistance = convertDistance(tripDistanceMiles);

      if (status === 'completed') {
        const requestTime = new Date(request_time);
        const beginTime = new Date(begin_trip_time);
        if (beginTime.getTime() && requestTime.getTime() && beginTime > requestTime) {
          const waitingMinutes = (beginTime - requestTime) / (1000 * 60);
          waitingTimeContent = `<b>Waiting Time:</b> ${waitingMinutes.toFixed(2)} minutes<br>`;
        }
        const dropoffTime = new Date(dropoff_time);

        if (!isNaN(tripDistanceMiles) && beginTime.getTime() && dropoffTime.getTime() && dropoffTime > beginTime) {
          const durationHours = (dropoffTime - beginTime) / (1000 * 60 * 60);
          if (durationHours > 0) {
            const speed = displayDistance / durationHours;
            speedContent = `<b>Average Speed:</b> ${speed.toFixed(2)} ${distanceUnit === 'miles' ? 'mph' : 'km/h'}<br>`;
          }
        }
      }

      let content = `
        <b>${pointType === 'begin' ? 'Begin Trip' : 'Dropoff'} Details</b><br>
        <b>City:</b> ${city || 'N/A'}<br>
        <b>Product Type:</b> ${product_type || 'N/A'}<br>
        <b>Status:</b> ${status || 'N/A'}<br>
        <b>Request Time:</b> ${request_time || 'N/A'}<br>
        <b>Begin Trip Time:</b> ${begin_trip_time || 'N/A'}<br>
        ${waitingTimeContent}
        <b>Dropoff Time:</b> ${dropoff_time || 'N/A'}<br>
        <b>Address:</b> ${address || 'N/A'}<br>
        <b>Distance:</b> ${!isNaN(displayDistance) ? `${displayDistance.toFixed(2)} ${distanceUnit}` : 'N/A'}<br>
        ${speedContent}
        <b>Fare:</b> ${fare_amount || 'N/A'} ${fare_currency || ''}<br>
        <b>Coordinates:</b> ${lat}, ${lng}<br>
      `;

      return content;
    };

    tripsToRender.forEach((r) => {
      const blt = toNumber(r.begintrip_lat);
      const bln = toNumber(r.begintrip_lng);
      const dlt = toNumber(r.dropoff_lat);
      const dln = toNumber(r.dropoff_lng);

      // Only add markers if both begin and dropoff coordinates are valid
      if (blt != null && bln != null) {
        bCount++;
        heatPoints.push([blt, bln]);
        const m = L.marker([blt, bln], { icon: greenIcon });
        m.bindPopup(createPopupContent('begin', r));
        beginLayerRef.current.addLayer(m);

        if (dlt != null && dln != null) {
          dCount++;
          heatPoints.push([dlt, dln]);
          const m = L.marker([dlt, dln], { icon: redIcon });
          m.bindPopup(createPopupContent('drop', r));
          dropLayerRef.current.addLayer(m);
        }
      }
    });

    heatLayerRef.current.setLatLngs(heatPoints);
    // Only update counts if we are showing all rows, not a focused trip
    if (!focusedTrip) {
      setBeginCount(bCount);
      setDropoffCount(dCount);
    }

    if (bCount + dCount > 0 && !focusedTrip) {
        fitToLayers();
    }
  }, [rows, focusedTrip]); // Re-run this effect when rows or focusedTrip changes

  useEffect(() => {
    if (rows.length > 0) {
      let currentTotalDistance = 0;
      let totalDurationMinutes = 0;
      let totalDurationHours = 0;
      const tripsWithDuration = [];
      const tripsWithDistance = [];
      const tripsWithSpeed = [];
      const tripsWithWaitingTime = [];
      let completedCount = 0;      
      let riderCanceledCount = 0;
      let driverCanceledCount = 0;
      const fareByCurrency = {};
      const fareCountByCurrency = {};
      const localLowestFare = {};
      const localHighestFare = {};

      rows.forEach(r => {
        const status = r.status?.toLowerCase();
        if (status === 'completed') {
          completedCount++;
          const distanceMiles = parseFloat(r.distance);
          const beginTime = new Date(r.begin_trip_time);
          const dropoffTime = new Date(r.dropoff_time);
          const requestTime = new Date(r.request_time);
 
          // Waiting time calculation
          if (requestTime.getTime() && beginTime.getTime() && beginTime > requestTime) {
            const waitingMinutes = (beginTime - requestTime) / (1000 * 60);
            if (isFinite(waitingMinutes)) {
              tripsWithWaitingTime.push({ waitingTime: waitingMinutes, row: r });
            }
          }
          if (!isNaN(distanceMiles) && beginTime.getTime() && dropoffTime.getTime() && dropoffTime > beginTime) {
            const durationHours = (dropoffTime - beginTime) / (1000 * 60 * 60);
            if (durationHours > 0) {
              if (distanceMiles > 0) {
                totalDurationMinutes += durationHours * 60;
                currentTotalDistance += convertDistance(distanceMiles);
                totalDurationHours += durationHours;
                const speed = convertDistance(distanceMiles) / durationHours;
                if (isFinite(speed)) {
                  tripsWithSpeed.push({ speed, row: r });
                }
              }
              tripsWithDuration.push({ duration: durationHours, row: r });
            }
            if (distanceMiles > 0) {
              tripsWithDistance.push({ distance: convertDistance(distanceMiles), row: r });
            }
          }

          const fare = parseFloat(r.fare_amount);
          const currency = r.fare_currency;
          if (currency && !isNaN(fare)) {
            if (!fareByCurrency[currency]) {
              fareByCurrency[currency] = 0; // total
              fareCountByCurrency[currency] = 0; // count
              localLowestFare[currency] = { amount: fare, row: r };
              localHighestFare[currency] = { amount: fare, row: r };
            }
            fareByCurrency[currency] += fare;
            fareCountByCurrency[currency]++;

            if (fare < localLowestFare[currency].amount) {
              localLowestFare[currency] = { amount: fare, row: r };
            }
            if (fare > localHighestFare[currency].amount) {
              localHighestFare[currency] = { amount: fare, row: r };
            }
          }
        } else if (status === 'rider_canceled') {
          riderCanceledCount++;
        } else if (status === 'driver_canceled') {
          driverCanceledCount++;
        }
      });

      const canceledCount = riderCanceledCount + driverCanceledCount;
      const unfulfilledCount = rows.length - completedCount - canceledCount;
      setTotalTrips(rows.length);
      setSuccessfulTrips(completedCount);
      setRiderCanceledTrips(riderCanceledCount);
      setDriverCanceledTrips(driverCanceledCount);
      setUnfulfilledTrips(unfulfilledCount);

      const avgFares = {};
      for (const currency in fareByCurrency) {
        if (fareCountByCurrency[currency] > 0) {
          avgFares[currency] = fareByCurrency[currency] / fareCountByCurrency[currency];
        }
      }
      setTotalFareByCurrency(fareByCurrency);
      setLowestFareByCurrency(localLowestFare);
      setHighestFareByCurrency(localHighestFare);
      setAvgFareByCurrency(avgFares);

      const localCostPerDistance = {};
      const localCostPerDuration = {};

      for (const currency in fareByCurrency) {
        if (currentTotalDistance > 0) {
          localCostPerDistance[currency] = fareByCurrency[currency] / currentTotalDistance;
        }
        if (totalDurationMinutes > 0) {
          localCostPerDuration[currency] = fareByCurrency[currency] / totalDurationMinutes;
        }
      }

      setCostPerDistanceByCurrency(localCostPerDistance);
      setCostPerDurationByCurrency(localCostPerDuration);

      setTotalCompletedDistance(currentTotalDistance);
      if (totalDurationHours > 0) {
        setAvgSpeed(currentTotalDistance / totalDurationHours);
        setTotalTripDuration(totalDurationMinutes);
      } else {
        setAvgSpeed(0);
      }

      if (tripsWithDuration.length > 0) {
        tripsWithDuration.sort((a, b) => a.duration - b.duration);

        const shortest = tripsWithDuration[0];
        const longest = tripsWithDuration[tripsWithDuration.length - 1];
        const totalDurationMinutes = tripsWithDuration.reduce((sum, trip) => sum + trip.duration * 60, 0);

        setAvgTripDuration(totalDurationMinutes / tripsWithDuration.length);
        setLongestTrip(longest.duration * 60);
        setShortestTrip(shortest.duration * 60);
        setLongestTripRow(longest.row);
        setShortestTripRow(shortest.row);
      } else {
        setAvgTripDuration(0); setLongestTrip(0); setShortestTrip(0); setLongestTripRow(null); setShortestTripRow(null); setTotalTripDuration(0);
      }

      if (tripsWithWaitingTime.length > 0) {
        tripsWithWaitingTime.sort((a, b) => a.waitingTime - b.waitingTime);
        const shortest = tripsWithWaitingTime[0];
        const longest = tripsWithWaitingTime[tripsWithWaitingTime.length - 1];
        const totalWaitingTime = tripsWithWaitingTime.reduce((sum, trip) => sum + trip.waitingTime, 0);
        setTotalWaitingTime(totalWaitingTime);
        setAvgWaitingTime(totalWaitingTime / tripsWithWaitingTime.length);
        setShortestWaitingTime(shortest.waitingTime);
        setShortestWaitingTimeRow(shortest.row);
        setLongestWaitingTime(longest.waitingTime);
        setLongestWaitingTimeRow(longest.row);
      } else {
        setAvgTripDuration(0); setLongestTrip(0); setShortestTrip(0); setLongestTripRow(null); setShortestTripRow(null); setTotalTripDuration(0);
      }

      if (tripsWithDistance.length > 0) {
        tripsWithDistance.sort((a, b) => a.distance - b.distance);
        const shortest = tripsWithDistance[0];
        const longest = tripsWithDistance[tripsWithDistance.length - 1];

        setShortestTripByDist(shortest.distance);
        setShortestTripByDistRow(shortest.row);
        setLongestTripByDist(longest.distance);
        setLongestTripByDistRow(longest.row);
      } else {
        setShortestTripByDist(0); setShortestTripByDistRow(null);
        setLongestTripByDist(0); setLongestTripByDistRow(null);
      }

      if (tripsWithSpeed.length > 0) {
        tripsWithSpeed.sort((a, b) => a.speed - b.speed);
        const slowest = tripsWithSpeed[0];
        const fastest = tripsWithSpeed[tripsWithSpeed.length - 1];

        setSlowestTripBySpeed(slowest.speed);
        setSlowestTripBySpeedRow(slowest.row);
        setFastestTripBySpeed(fastest.speed);
        setFastestTripBySpeedRow(fastest.row);
      } else {
        setSlowestTripBySpeed(0); setSlowestTripBySpeedRow(null);
        setFastestTripBySpeed(0); setFastestTripBySpeedRow(null);
      }
    }

  }, [rows, distanceUnit]); // Re-run this effect when rows or distanceUnit changes


  const actionsEnabled = rows.length > 0 && !isProcessing;

  return (
    <>
      {isProcessing && <Spinner />}
      <header>
        <h1 className="text-3xl font-bold underline">CSV → Map & KML</h1>
        <div className="layout-controls">
          <button onClick={() => setLayout('sidebar')} className={layout === 'sidebar' ? 'primary' : ''} title="Stats View">📊</button>
          <button onClick={() => setLayout('split')} className={layout === 'split' ? 'primary' : ''} title="Split View">🌗</button>
          <button onClick={() => setLayout('map')} className={layout === 'map' ? 'primary' : ''} title="Map View">🗺️</button>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          {rows.length > 0 && (
            <button onClick={resetMap} disabled={!actionsEnabled && !error}>Clear</button>
          )}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="hint">Unit:</span>
          <button className={distanceUnit === 'miles' ? 'primary' : ''} onClick={() => setDistanceUnit('miles')}>Miles</button>
          <button className={distanceUnit === 'km' ? 'primary' : ''} onClick={() => setDistanceUnit('km')}>Kilometers</button>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="initial-view">
          <div
            className={`section dropzone ${isDragging ? 'drag' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragEnter={handleDragEvents}
            onDragOver={handleDragEvents}
            onDragLeave={handleDragEvents}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p>Drag & drop CSV here, or click to select file</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={isProcessing}
              className="visually-hidden"
            />
          </div>
          {error && (
            <div className="section error" style={{marginTop: '20px', width: '100%', maxWidth: '600px'}}>
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className={`container layout-${layout}`}>
          <aside
            className="sidebar"
            style={layout === 'split' ? { flex: '0 0 70%' } : {}}
          >
            {focusedTrip && (
              <div className="section focused-trip-info">
                <div className="trip-list-header">
                  <h3>Focused Trip</h3>
                  <button onClick={handleShowAll} style={{marginLeft: 'auto'}}>Show All</button>
                </div>
                <p>
                  <strong>Status:</strong> <span className={`status-pill ${focusedTrip.status?.toLowerCase()}`}>{focusedTrip.status || 'N/A'}</span><br/>
                  <strong>From:</strong> {focusedTrip.begintrip_address || 'N/A'}<br/>
                  <strong>To:</strong> {focusedTrip.dropoff_address || 'N/A'}<br/>
                  <strong>Distance:</strong> {convertDistance(parseFloat(focusedTrip.distance)).toFixed(2)} {distanceUnit}
                </p>
              </div>
            )}
            {sidebarView === 'stats' && (
              <>
                {error && (
                  <div className="section error">
                    {error}
                  </div>
                )}

                <div className="section">
                  <div className="stats-group">
                    <h3>Trip Summary</h3>
                    <div className="stats-grid">
                      <Stat label="Total Requests" value={totalTrips} onClick={() => handleShowTripList('all')} />
                      <Stat label="Successful" value={successfulTrips} onClick={() => handleShowTripList('successful')} />
                      <Stat label="Rider Canceled" value={riderCanceledTrips} onClick={() => handleShowTripList('rider_canceled')} />
                      <Stat label="Driver Canceled" value={driverCanceledTrips} onClick={() => handleShowTripList('driver_canceled')} />
                    </div>
                  </div>

                  {Object.keys(totalFareByCurrency).length > 0 && (
                    <div className="stats-group">
                      <h3>Fare</h3>
                      <div className="stats-grid">
                        {Object.entries(totalFareByCurrency).map(([currency, amount]) => (
                          <Stat
                            key={currency}
                            label="Total Fare"
                            unit={currency}
                            value={amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          />
                        ))}
                        {Object.entries(avgFareByCurrency).map(([currency, amount]) => (
                          <Stat
                            key={currency}
                            label="Avg. Fare"
                            unit={currency}
                            value={amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          />
                        ))}
                        {Object.entries(lowestFareByCurrency).map(([currency, data]) => (
                          <Stat
                            key={`${currency}-lowest`}
                            label="Lowest Fare"
                            unit={currency}
                            value={data.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            onClick={() => handleFocusOnTrip(data.row)}
                          />
                        ))}
                        {Object.entries(highestFareByCurrency).map(([currency, data]) => (
                          <Stat
                            key={`${currency}-highest`}
                            label="Highest Fare"
                            unit={currency}
                            value={data.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            onClick={() => handleFocusOnTrip(data.row)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="stats-group">
                    <h3>Ride Duration</h3>
                    <div className="stats-grid">
                      <Stat label="Total" value={formatDuration(totalTripDuration, true)} />
                      <Stat label="Average" value={formatDurationWithSeconds(avgTripDuration)} />
                      <Stat label="Longest" value={formatDurationWithSeconds(longestTrip)} onClick={() => handleFocusOnTrip(longestTripRow)} />
                      <Stat label="Shortest" value={formatDurationWithSeconds(shortestTrip)} onClick={() => handleFocusOnTrip(shortestTripRow)} />
                    </div>
                    <h3 style={{marginTop: '16px'}}>Waiting Time</h3>
                    <div className="stats-grid">
                      <Stat label="Total" value={formatDuration(totalWaitingTime, true)} />
                      <Stat label="Average" value={formatDurationWithSeconds(avgWaitingTime)} />
                      <Stat label="Longest" value={formatDurationWithSeconds(longestWaitingTime)} onClick={() => handleFocusOnTrip(longestWaitingTimeRow)} />
                      <Stat label="Shortest" value={formatDurationWithSeconds(shortestWaitingTime)} onClick={() => handleFocusOnTrip(shortestWaitingTimeRow)} />
                    </div>
                  </div>

                  <div className="stats-group">
                    <h3>Distance</h3>
                    <div className="stats-grid">
                      <Stat label="Total" value={totalCompletedDistance.toFixed(2)} unit={distanceUnit} />
                      <Stat label="Longest" value={longestTripByDist.toFixed(2)} unit={distanceUnit} onClick={() => handleFocusOnTrip(longestTripByDistRow)} />
                      <Stat label="Shortest" value={shortestTripByDist.toFixed(2)} unit={distanceUnit} onClick={() => handleFocusOnTrip(shortestTripByDistRow)} />
                      {Object.entries(costPerDistanceByCurrency).map(([currency, amount]) => (
                        <Stat
                          key={currency}
                          label={`Cost per ${distanceUnit}`}
                        unit={`${currency}/${distanceUnit}`}
                          value={amount.toFixed(2)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="stats-group">
                    <h3>Speed</h3>
                    <div className="stats-grid">
                      <Stat label="Avg. Speed" value={avgSpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} />
                      <Stat label="Fastest Avg. Speed" value={fastestTripBySpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} onClick={() => handleFocusOnTrip(fastestTripBySpeedRow)} />
                      <Stat label="Slowest Avg. Speed" value={slowestTripBySpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} onClick={() => handleFocusOnTrip(slowestTripBySpeedRow)} />
                      {Object.entries(costPerDurationByCurrency).map(([currency, amount]) => (
                        <Stat
                          key={currency}
                          label="Cost"
                          unit={currency}
                          value={amount.toFixed(2)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="section">
                  <div className="row" style={{gap: '6px'}}>
                    <button onClick={() => handleDownloadKML('both')} disabled={!actionsEnabled}>Download KML (both)</button>
                    <button onClick={() => handleDownloadKML('begin')} disabled={!actionsEnabled}>Begintrip KML</button>
                    <button onClick={() => handleDownloadKML('drop')} disabled={!actionsEnabled}>Dropoff KML</button>
                  </div>
                  <div className="footer">KML uses colored icons (green/red). Works in Google Earth / Maps.</div>
                </div>

                <div className="section">
                  <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} disabled={isProcessing} />
                  <div className="footer">Select a new CSV file to replace the current data.</div>
                </div>
              </>
            )}
            {sidebarView === 'tripList' && (
              <div className="section">
                <div className="trip-list-header">
                  <button onClick={() => setSidebarView('stats')}>← Back</button>
                  <h3>{tripListTitle}</h3>
                </div>
                <ul className="trip-list">
                  {tripList.map((trip, index) => (
                    <li key={index} onClick={() => handleFocusOnTrip(trip)}>
                      <div className="trip-list-item-header">
                        <strong>Trip #{index + 1}</strong>
                        <span className={`status-pill ${trip.status?.toLowerCase()}`}>{trip.status || 'N/A'}</span>
                      </div>
                      <div className="trip-list-item-body">
                        From: {trip.begintrip_address || 'N/A'}<br/>
                        To: {trip.dropoff_address || 'N/A'}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          <div
            className="map-container"
            style={layout === 'split' ? { flex: '1 1 30%' } : {}}
          >
            <main id="map"></main>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
