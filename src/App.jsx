import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // --- Refs for Leaflet objects and file input ---
  const mapRef = useRef(null);
  const beginLayerRef = useRef(null);
  const dropLayerRef = useRef(null);
  const fileInputRef = useRef(null);

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
      } catch (e) {
        // This can happen if there are no layers, which is fine.
      }
    }
  };

  const resetMap = () => {
    beginLayerRef.current?.clearLayers();
    dropLayerRef.current?.clearLayers();
    setRows([]);
    setBeginCount(0);
    setDropoffCount(0);
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
        return {
          begintrip_lat: out['begintrip_lat'],
          begintrip_lng: out['begintrip_lng'],
          dropoff_lat:   out['dropoff_lat'],
          dropoff_lng:   out['dropoff_lng']
        };
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

      L.control.layers(null, {
        'Begintrip (green)': beginLayerRef.current,
        'Dropoff (red)': dropLayerRef.current
      }).addTo(map);

      map.setView([20, 0], 2);
    }
  }, []); // Empty dependency array ensures this runs only once

  // Render markers when rows change
  useEffect(() => {
    beginLayerRef.current?.clearLayers();
    dropLayerRef.current?.clearLayers();

    let bCount = 0, dCount = 0;

    rows.forEach((r, idx) => {
      const blt = toNumber(r.begintrip_lat);
      const bln = toNumber(r.begintrip_lng);
      const dlt = toNumber(r.dropoff_lat);
      const dln = toNumber(r.dropoff_lng);

      if (blt != null && bln != null) {
        bCount++;
        const m = L.marker([blt, bln], { icon: greenIcon })
          .bindPopup(`<b>Begintrip</b><br/>Row: ${idx + 1}<br/>Lat: ${blt}<br/>Lng: ${bln}`);
        beginLayerRef.current.addLayer(m);
      }
      if (dlt != null && dln != null) {
        dCount++;
        const m = L.marker([dlt, dln], { icon: redIcon })
          .bindPopup(`<b>Dropoff</b><br/>Row: ${idx + 1}<br/>Lat: ${dlt}<br/>Lng: ${dln}`);
        dropLayerRef.current.addLayer(m);
      }
    });

    setBeginCount(bCount);
    setDropoffCount(dCount);

    if (bCount + dCount > 0) {
        fitToLayers();
    }

  }, [rows]); // Re-run this effect whenever 'rows' state changes


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
