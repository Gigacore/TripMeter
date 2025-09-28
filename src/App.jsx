import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import Papa from 'papaparse';
import './App.css';

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
  const [longestTripByDistRow, setLongestTripByDistRow] = useState(null);
  const [shortestTripRow, setShortestTripRow] = useState(null);
  const [shortestTripByDistRow, setShortestTripByDistRow] = useState(null);
  const [avgTripDuration, setAvgTripDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [focusedTrip, setFocusedTrip] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [distanceUnit, setDistanceUnit] = useState('miles'); // 'miles' or 'km'

  // --- Refs for Leaflet objects and file input ---
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
    setLongestTripByDistRow(null);
    setShortestTripRow(null);
    setShortestTripByDistRow(null);
    setAvgTripDuration(0);
    setFocusedTrip(null);
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

  // --- Effects ---
  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
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
  }, []); // Empty dependency array ensures this runs only once

  const handleShowAll = () => {
    setFocusedTrip(null);
    fitToLayers();
  };

  // Render markers when rows change
  useEffect(() => {
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

      if (blt != null && bln != null) {
        bCount++;
        heatPoints.push([blt, bln]);
        const m = L.marker([blt, bln], { icon: greenIcon });
        m.bindPopup(createPopupContent('begin', r));
        beginLayerRef.current.addLayer(m);
      }
      if (dlt != null && dln != null) {
        dCount++;
        heatPoints.push([dlt, dln]);
        const m = L.marker([dlt, dln], { icon: redIcon });
        m.bindPopup(createPopupContent('drop', r));
        dropLayerRef.current.addLayer(m);
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
      let totalDistance = 0;
      let totalDurationHours = 0;
      const tripsWithDuration = [];
      const tripsWithDistance = [];

      rows.forEach(r => {
        if (r.status === 'completed') {
          const distanceMiles = parseFloat(r.distance);
          const beginTime = new Date(r.begin_trip_time);
          const dropoffTime = new Date(r.dropoff_time);
 
          if (!isNaN(distanceMiles) && beginTime.getTime() && dropoffTime.getTime() && dropoffTime > beginTime) {
            const durationHours = (dropoffTime - beginTime) / (1000 * 60 * 60);
            if (durationHours > 0) {
              if (distanceMiles > 0) {
                totalDistance += convertDistance(distanceMiles);
                totalDurationHours += durationHours;
              }
              tripsWithDuration.push({ duration: durationHours, row: r });
            }
            if (distanceMiles > 0) {
              tripsWithDistance.push({ distance: convertDistance(distanceMiles), row: r });
            }
          }
        }
      });

      if (totalDurationHours > 0) {
        setAvgSpeed(totalDistance / totalDurationHours);
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
        setAvgTripDuration(0); setLongestTrip(0); setShortestTrip(0); setLongestTripRow(null); setShortestTripRow(null);
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
    }

  }, [rows, distanceUnit]); // Re-run this effect when rows or distanceUnit changes


  const actionsEnabled = rows.length > 0 && !isProcessing;

  return (
    <>
      <header>
        <h1 className="text-3xl font-bold underline">CSV → Map & KML</h1>
        <span className="pill"><span className="dot green"></span> begintrip pins</span>
        <span className="pill"><span className="dot red"></span> dropoff pins</span>
        <span className="hint">Expected headers: <code>begintrip_lat</code>, <code>begintrip_lng</code>, <code>dropoff_lat</code>, <code>dropoff_lng</code></span>
      </header>

      <div className="container">
        <aside className="sidebar">
          <div className="section">
            <label htmlFor="fileInput">Upload CSV</label>
            <input
              ref={fileInputRef}
              id="fileInput"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={isProcessing}
            />
          </div>

          <div
            className={`section dropzone ${isDragging ? 'drag' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragEnter={handleDragEvents}
            onDragOver={handleDragEvents}
            onDragLeave={handleDragEvents}
          >
            Drag & drop CSV here
          </div>

          <div className="section">
            <label>Distance Unit</label>
            <div className="row" style={{gap: '6px'}}>
              <button className={distanceUnit === 'miles' ? 'primary' : ''} onClick={() => setDistanceUnit('miles')}>Miles</button>
              <button className={distanceUnit === 'km' ? 'primary' : ''} onClick={() => setDistanceUnit('km')}>Kilometers</button>
            </div>
          </div>


          {error && (
            <div className="section error">
              {error}
            </div>
          )}

          <div className="section stats">
            <div className="stat">
              <div>Begintrip points</div>
              <div style={{fontSize: '20px', fontWeight: 700}}>{beginCount}</div>
            </div>
            <div className="stat">
              <div>Dropoff points</div>
              <div style={{fontSize: '20px', fontWeight: 700}}>{dropoffCount}</div>
            </div>
            <div className="stat">
              <div>Avg. Speed ({distanceUnit === 'miles' ? 'mph' : 'km/h'})</div>
              <div style={{fontSize: '20px', fontWeight: 700}}>{avgSpeed.toFixed(2)}</div>
            </div>
            <div className="stat">
              <div>Avg. Duration (min)</div>
              <div style={{fontSize: '20px', fontWeight: 700}}>{avgTripDuration.toFixed(2)}</div>
            </div>
            <div className="stat clickable" onClick={() => handleFocusOnTrip(longestTripRow)}>
              <div>Longest Trip (min)</div>
              <div style={{fontSize: '20px', fontWeight: 700}}>{longestTrip.toFixed(2)}</div>
            </div>
            <div className="stat clickable" onClick={() => handleFocusOnTrip(shortestTripRow)}>
              <div>Shortest Trip (min)</div>
              <div style={{fontSize: '20px', fontWeight: 700}}>{shortestTrip.toFixed(2)}</div>
            </div>
            <div className="stat clickable" onClick={() => handleFocusOnTrip(longestTripByDistRow)}>
              <div>Longest Trip ({distanceUnit})</div>
              <div style={{fontSize: '20px', fontWeight: 700}}>{longestTripByDist.toFixed(2)}</div>
            </div>
            <div className="stat clickable" onClick={() => handleFocusOnTrip(shortestTripByDistRow)}>
              <div>Shortest Trip ({distanceUnit})</div>
              <div style={{fontSize: '20px', fontWeight: 700}}>{shortestTripByDist.toFixed(2)}</div>
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
            {focusedTrip && (
              <button onClick={handleShowAll} className="primary full-width">
                Show All Trips
              </button>
            )}
            <button onClick={resetMap} disabled={!actionsEnabled && !error}>Clear Map</button>
          </div>
        </aside>

        <div className="map-container">
          <main id="map"></main>
        </div>
      </div>
    </>
  );
}

export default App;
