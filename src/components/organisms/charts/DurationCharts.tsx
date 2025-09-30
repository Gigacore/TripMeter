import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import Stat from '../../atoms/Stat';
import { formatDuration, formatDurationWithSeconds } from '../../../utils/formatters';
import { CSVRow } from '../../../services/csvParser';
import { TripStats } from '../../../hooks/useTripData';

interface DurationChartsProps {
  data: TripStats;
  rows: CSVRow[];
  onFocusOnTrip: (tripRow: CSVRow) => void;
}

const DurationCharts: React.FC<DurationChartsProps> = ({
  data,
  rows,
  onFocusOnTrip,
}) => {
  const {
    totalTripDuration,
    avgTripDuration,
    longestTrip,
    longestTripRow,
    shortestTrip,
    shortestTripRow,
  } = data;

  const durationDistributionData = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const durations = rows
      .filter(r => r.status?.toLowerCase() === 'completed' && r.begin_trip_time && r.dropoff_time)
      .map(r => (new Date(r.dropoff_time).getTime() - new Date(r.begin_trip_time).getTime()) / (1000 * 60)) // in minutes
      .filter(d => d > 0);
    if (durations.length === 0) return [];

    const maxDuration = Math.max(...durations);
    const bucketCount = 10;
    const bucketSize = Math.ceil(maxDuration / bucketCount) || 1;

    const buckets = Array.from({ length: bucketCount }, () => 0);
    durations.forEach(duration => {
      const bucketIndex = Math.min(Math.floor(duration / bucketSize), bucketCount - 1);
      buckets[bucketIndex]++;
    });

    return buckets.map((count, i) => ({
      name: `${i * bucketSize}-${(i + 1) * bucketSize} min`,
      count,
    }));
  }, [rows]);

  return (
    <div className="stats-group">
      <h3>Ride Duration</h3>
      {durationDistributionData.length > 0 && (
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={durationDistributionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" name="Number of Trips" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="stats-grid four-col mt-4">
        <Stat label="Total" value={formatDuration(totalTripDuration, true)} />
        <Stat label="Average" value={formatDurationWithSeconds(avgTripDuration)} />
        <Stat label="Longest" value={formatDurationWithSeconds(longestTrip)} onClick={() => longestTripRow && onFocusOnTrip(longestTripRow)} />
        <Stat label="Shortest" value={formatDurationWithSeconds(shortestTrip)} onClick={() => shortestTripRow && onFocusOnTrip(shortestTripRow)} />
      </div>
    </div>
  );
};

export default DurationCharts;