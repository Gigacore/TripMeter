import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, TooltipProps } from 'recharts';
import Stat from '../../atoms/Stat';
import { formatDuration, formatDurationWithSeconds } from '../../../utils/formatters';
import { CSVRow } from '../../../services/csvParser';
import { TripStats } from '../../../hooks/useTripData';

interface DurationChartsProps {
  data: TripStats;
  rows: CSVRow[];
  onFocusOnTrip: (tripRow: CSVRow) => void;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="min-w-[200px] rounded-lg border border-slate-700 bg-slate-800/80 p-4 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <div className="mb-2 border-b border-slate-700 pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{`Duration: ${label}`}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="text-slate-400">Trips</div>
          <div className="font-medium text-right text-sky-400">{payload[0].value?.toLocaleString()}</div>
        </div>
      </div>
    );
  }

  return null;
};

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
      <h3 className="mb-2">Ride Duration Distribution</h3>
      {durationDistributionData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={durationDistributionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
            <Bar dataKey="count" fill="#38bdf8" name="Number of Trips" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 w-full mt-4">
        <Stat label="Total" value={formatDuration(totalTripDuration, true)} />
        <Stat label="Average" value={formatDurationWithSeconds(avgTripDuration)} />
        <Stat label="Longest" value={formatDurationWithSeconds(longestTrip)} onClick={() => longestTripRow && onFocusOnTrip(longestTripRow)} />
        <Stat label="Shortest" value={formatDurationWithSeconds(shortestTrip)} onClick={() => shortestTripRow && onFocusOnTrip(shortestTripRow)} />
      </div>
    </div>
  );
};

export default DurationCharts;