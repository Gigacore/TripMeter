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

import { toNumber } from '../utils/formatters';
export const downloadKML = (rows, which) => {
    const parts = makeParts(rows, { which });
    const kml = buildKML(parts);
    download(`trips_${which}.kml`, kml);
};

const makeParts = (rows, { which = 'both' } = {}) => {
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