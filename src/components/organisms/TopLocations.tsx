import React, { useMemo, useState } from 'react';
import { CSVRow } from '../../services/csvParser';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { featureCollection, point } from '@turf/helpers';
import clustersDbscan from '@turf/clusters-dbscan';
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
  lngField: keyof CSVRow
): LocationData[] => {
  const points = featureCollection(
    trips.map((trip) => {
      const lat = parseFloat(trip[latField] as string);
      const lng = parseFloat(trip[lngField] as string);
      if (isNaN(lat) || isNaN(lng)) return null;
      return point([lng, lat], { trip });
    }).filter((p): p is GeoJSON.Feature<GeoJSON.Point, { trip: CSVRow }> => p !== null)
  );

  if (points.features.length === 0) return [];

  // Use DBSCAN for clustering.
  // maxDistance (epsilon) is in kilometers. 0.2km = 200 meters.
  // minPoints is the minimum number of points to form a dense region.
  const clustered = clustersDbscan(points, 0.2, { minPoints: 3 });

  const clusters: { [key: number]: { points: { lat: number, lng: number }[], addresses: (string | undefined)[] } } = {};

  clustered.features.forEach(feature => {
    const clusterId = feature.properties.cluster;
    if (clusterId !== undefined) {
      if (!clusters[clusterId]) {
        clusters[clusterId] = { points: [], addresses: [] };
      }
      const [lng, lat] = feature.geometry.coordinates;
      clusters[clusterId].points.push({ lat, lng });
      const addressField = latField === 'begintrip_lat' ? 'begintrip_address' : 'dropoff_address';
      clusters[clusterId].addresses.push(feature.properties.trip[addressField]);
    }
  });

  return Object.values(clusters)
    .map(cluster => {
      const count = cluster.points.length;
      const avgLat = cluster.points.reduce((sum, p) => sum + p.lat, 0) / count;
      const avgLng = cluster.points.reduce((sum, p) => sum + p.lng, 0) / count;
      return { lat: avgLat, lng: avgLng, count, commonAddress: getMostCommonAddress(cluster.addresses) };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((cluster, idx) => ({ rank: idx + 1, ...cluster }));
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
  const completedTrips = useMemo(() => rows.filter(row => row.status?.toLowerCase() === 'completed'), [rows]);

  const [pickupsExpanded, setPickupsExpanded] = useState(false);
  const [dropoffsExpanded, setDropoffsExpanded] = useState(false);

  const topPickups = useMemo(() => analyzeLocations(completedTrips, 'begintrip_lat', 'begintrip_lng'), [completedTrips]);
  const topDropoffs = useMemo(() => analyzeLocations(completedTrips, 'dropoff_lat', 'dropoff_lng'), [completedTrips]);

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