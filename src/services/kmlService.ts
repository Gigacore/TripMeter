import { toNumber } from '../utils/formatters';
import { CSVRow } from './csvParser';

interface KMLPart {
  name: string;
  styleUrl?: string;
  desc?: string;
  coords: [number, number];
}

type Which = 'both' | 'begin' | 'drop';

export const makeParts = (rows: CSVRow[], { which = 'both' }: { which?: Which } = {}): KMLPart[] => {
    const parts: KMLPart[] = [];
    rows.forEach((r, idx) => {
      const rowNo = idx + 1;
      if (which === 'both' || which === 'begin') {
        if (r.begintrip_lat != null && r.begintrip_lng != null) {
          const lat = toNumber(r.begintrip_lat);
          const lng = toNumber(r.begintrip_lng);
          parts.push({ name: `Begintrip #${rowNo}`, styleUrl: 'beginStyle', coords: [lng, lat] });
        }
      }
      if (which === 'both' || which === 'drop') {
        if (r.dropoff_lat != null && r.dropoff_lng != null) {
          const lat = toNumber(r.dropoff_lat);
          const lng = toNumber(r.dropoff_lng);
          parts.push({ name: `Dropoff #${rowNo}`, styleUrl: 'dropStyle', coords: [lng, lat] });
        }
      }
    });
    return parts;
  };

export const buildKML = (parts: KMLPart[]): string => {
    const esc = (s: string | number) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const style = (id: string, href: string) => `\n  <Style id="${id}">\n    <IconStyle>\n      <scale>1.1</scale>\n      <Icon><href>${href}</href></Icon>\n    </IconStyle>\n  </Style>`;
    const items = parts.map(p => `\n  <Placemark>\n    <name>${esc(p.name)}</name>\n    ${p.styleUrl ? `<styleUrl>#${p.styleUrl}</styleUrl>` : ''}\n    ${p.desc ? `<description>${esc(p.desc)}</description>` : ''}\n    <Point><coordinates>${p.coords[0]},${p.coords[1]},0</coordinates></Point>\n  </Placemark>`).join('');
    const kml = `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n  <name>Trips (Begin/Dropoff)</name>`
      + style('beginStyle','https://maps.google.com/mapfiles/ms/icons/green-dot.png')
      + style('dropStyle','https://maps.google.com/mapfiles/ms/icons/red-dot.png')
      + items + '\n</Document>\n</kml>';
    return kml;
};

const download = (filename: string, text: string): void => {
    const blob = new Blob([text], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
};

export const downloadKML = (rows: CSVRow[], which: Which = 'both'): void => {
    const parts = makeParts(rows, { which });
    const kml = buildKML(parts);
    download(`trips_${which}.kml`, kml);
};