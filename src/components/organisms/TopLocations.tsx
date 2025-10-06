import React, { useMemo, useState } from 'react';
import { CSVRow } from '../../services/csvParser';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopLocationsProps {
  rows: CSVRow[];
}

interface LocationData {
  rank: number;
  lat: number;
  lng: number;
  count: number;
  commonAddress: string;
}

const getMostCommonAddress = (addresses: (string | undefined)[]): string => {
  if (!addresses.length) return 'N/A';
  const counts: { [key: string]: number } = {};
  addresses.forEach(addr => {
    if (addr) {
      counts[addr] = (counts[addr] || 0) + 1;
    }
  });
  if (Object.keys(counts).length === 0) return 'N/A';
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0];
};

const analyzeLocations = (
  trips: CSVRow[],
  latField: keyof CSVRow,
  lngField: keyof CSVRow,
  addressField: keyof CSVRow,
  gridSize: number
): LocationData[] => {
  const grid: { [key: string]: { lat: number; lng: number; count: number; addresses: (string | undefined)[] } } = {};

  trips.forEach(trip => {
    const lat = parseFloat(trip[latField] as string);
    const lng = parseFloat(trip[lngField] as string);

    if (isNaN(lat) || isNaN(lng)) return;

    const gridLat = Math.floor(lat / gridSize) * gridSize;
    const gridLng = Math.floor(lng / gridSize) * gridSize;
    const key = `${gridLat.toFixed(6)},${gridLng.toFixed(6)}`;

    if (!grid[key]) {
      grid[key] = {
        lat: gridLat + gridSize / 2,
        lng: gridLng + gridSize / 2,
        count: 0,
        addresses: []
      };
    }

    grid[key].count++;
    grid[key].addresses.push(trip[addressField]);
  });

  return Object.values(grid)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((loc, idx) => ({
      rank: idx + 1,
      lat: loc.lat,
      lng: loc.lng,
      count: loc.count,
      commonAddress: getMostCommonAddress(loc.addresses)
    }));
};

const LocationTable: React.FC<{
  locations: LocationData[];
  type: string;
  isExpanded: boolean;
  onToggle: () => void;
  canExpand: boolean;
}> = ({ locations, type, isExpanded, onToggle, canExpand }) => (
  <div>
    <div className="flex items-center gap-2 mb-4">
      <MapPin className="text-primary" size={24} />
      <h4 className="text-lg font-semibold text-card-foreground">Top {type} Locations</h4>
    </div>
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="border-b border-border">
            <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Rank</th>
            <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Trips</th>
            <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Coordinates</th>
            <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Common Address</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc) => (
            <tr key={loc.rank} className="border-b border-border last:border-b-0 hover:bg-muted/50">
              <td className="py-3 px-3 font-medium text-muted-foreground w-16 text-center">
                {loc.rank}
              </td>
              <td className="py-3 px-3 font-semibold text-foreground">{loc.count}</td>
              <td className="py-3 px-3 text-muted-foreground font-mono">
                {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
              </td>
              <td className="py-3 px-3 text-muted-foreground max-w-xs truncate" title={loc.commonAddress}>
                {loc.commonAddress}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {canExpand && (
      <div className="mt-2 text-center">
        <Button variant="ghost" size="sm" onClick={onToggle} className="text-sm text-muted-foreground">
          {isExpanded ? 'Show Top 5' : 'Show Top 10'}
          {isExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    )}
  </div>
);

const TopLocations: React.FC<TopLocationsProps> = ({ rows }) => {
  const gridSize = 0.005; // Fixed grid size, ~555m

  const completedTrips = useMemo(() => rows.filter(row => row.status?.toLowerCase() === 'completed'), [rows]);

  const [pickupsExpanded, setPickupsExpanded] = useState(false);
  const [dropoffsExpanded, setDropoffsExpanded] = useState(false);

  const topPickups = useMemo(() => analyzeLocations(completedTrips, 'begintrip_lat', 'begintrip_lng', 'begintrip_address', gridSize), [completedTrips]);
  const topDropoffs = useMemo(() => analyzeLocations(completedTrips, 'dropoff_lat', 'dropoff_lng', 'dropoff_address', gridSize), [completedTrips]);

  if (completedTrips.length === 0) {
    return <p className="text-muted-foreground text-sm mt-2">No completed trips to analyze for top locations.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {topPickups.length > 0 && (
        <LocationTable
          locations={pickupsExpanded ? topPickups : topPickups.slice(0, 5)}
          type="Pickup"
          isExpanded={pickupsExpanded}
          onToggle={() => setPickupsExpanded(!pickupsExpanded)}
          canExpand={topPickups.length > 5}
        />
      )}
      {topDropoffs.length > 0 && (
        <LocationTable
          locations={dropoffsExpanded ? topDropoffs : topDropoffs.slice(0, 5)}
          type="Drop-off"
          isExpanded={dropoffsExpanded}
          onToggle={() => setDropoffsExpanded(!dropoffsExpanded)}
          canExpand={topDropoffs.length > 5}
        />
      )}
    </div>
  );
};

export default TopLocations;