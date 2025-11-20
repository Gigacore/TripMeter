import React, { useMemo, useState } from 'react';
import { CSVRow } from '../../services/csvParser';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { featureCollection, point } from '@turf/helpers';
import clustersDbscan from '@turf/clusters-dbscan';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Map from './Map';

interface TopLocationsProps {
  rows: CSVRow[];
}

interface LocationData {
  rank: number;
  lat: number;
  lng: number;
  count: number;
  commonAddress: string;
  type: 'pickup' | 'dropoff';
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
  type: 'pickup' | 'dropoff'
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
      return { lat: avgLat, lng: avgLng, count, commonAddress: getMostCommonAddress(cluster.addresses), type };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((cluster, idx) => ({ rank: idx + 1, ...cluster }));
};

const TopLocations: React.FC<TopLocationsProps> = ({ rows }) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  const { cities, completedTrips } = useMemo(() => {
    const completed = rows.filter(row => row.status?.toLowerCase() === 'completed');
    const citySet = new Set<string>();
    completed.forEach(row => {
      if (row.city) {
        citySet.add(row.city);
      }
    });
    return { cities: Array.from(citySet).sort(), completedTrips: completed };
  }, [rows]);

  const filteredTrips = useMemo(() => {
    if (selectedCity === 'all') {
      return completedTrips;
    }
    return completedTrips.filter(trip => trip.city === selectedCity);
  }, [completedTrips, selectedCity]);

  const topPickups = useMemo(() => analyzeLocations(filteredTrips, 'begintrip_lat', 'begintrip_lng', 'pickup'), [filteredTrips]);
  const topDropoffs = useMemo(() => analyzeLocations(filteredTrips, 'dropoff_lat', 'dropoff_lng', 'dropoff'), [filteredTrips]);

  const combinedLocations = useMemo(() => {
    const combined: LocationData[] = [];
    const maxLength = Math.max(topPickups.length, topDropoffs.length);
    for (let i = 0; i < maxLength; i++) {
      if (topPickups[i]) {
        combined.push(topPickups[i]);
      }
      if (topDropoffs[i]) {
        combined.push(topDropoffs[i]);
      }
    }
    return combined;
  }, [topPickups, topDropoffs]);

  const locationsToShow = combinedLocations;

  const handleLocationClick = (location: LocationData) => {
    if (selectedLocation && selectedLocation.rank === location.rank && selectedLocation.type === location.type) {
      setSelectedLocation(null); // Deselect if clicking the same row
    } else {
      setSelectedLocation(location);
    }
  };

  if (completedTrips.length === 0) {
    return <p className="text-muted-foreground text-sm mt-2">No completed trips to analyze for top locations.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end items-center gap-2">
        <Label htmlFor="city-filter">City</Label>
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger id="city-filter" className="w-full md:w-[200px]" aria-label="Select city">
            <SelectValue placeholder="Select a city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <div className="bg-card rounded-xl shadow-sm overflow-hidden flex-grow border border-border">
            <div className="p-4 border-b border-border">
              <div className="flex items-center space-x-2">
                <MapPin className="text-primary" />
                <h2 className="text-lg font-semibold text-card-foreground">Top Pickup & Drop-off Locations</h2>
              </div>
            </div>
            <div className="relative">
              <div className="overflow-auto h-[570px]">
                <table className="w-full text-sm text-left relative">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium bg-muted/50 text-xs text-muted-foreground uppercase">Rank</th>
                      <th scope="col" className="px-4 py-3 font-medium bg-muted/50 text-xs text-muted-foreground uppercase">Type</th>
                      <th scope="col" className="px-4 py-3 font-medium bg-muted/50 text-xs text-muted-foreground uppercase">Trips</th>
                      <th scope="col" className="px-4 py-3 font-medium bg-muted/50 text-xs text-muted-foreground uppercase">Common Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationsToShow.map((loc) => (
                      <tr key={`${loc.type}-${loc.rank}`}
                        className={cn(
                          "border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer",
                          selectedLocation?.rank === loc.rank && selectedLocation?.type === loc.type && "bg-primary/10 dark:bg-primary/20"
                        )}
                        onClick={() => handleLocationClick(loc)}>
                        <td className="px-4 py-4 font-medium">{loc.rank}</td>
                        <td className="px-4 py-4">
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full capitalize",
                            loc.type === 'pickup' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          )}>
                            {loc.type}
                          </span>
                        </td>
                        <td className="px-4 py-4">{loc.count}</td>
                        <td className="px-4 py-4 max-w-xs truncate" title={loc.commonAddress}>{loc.commonAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="w-full h-96 lg:h-auto min-h-[400px] rounded-xl shadow-sm overflow-hidden">
          <Map
            rows={[]}
            focusedTrip={null}
            distanceUnit="miles"
            convertDistance={(m) => m}
            locations={selectedLocation ? [selectedLocation] : locationsToShow}
            selectedLocation={selectedLocation}
          />
        </div>
      </div>
    </div>
  );
};

export default TopLocations;