import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, TooltipProps, Cell } from 'recharts';
import Stat from '../../atoms/Stat';
import { CSVRow } from '../../../services/csvParser';
import { TripStats } from '../../../hooks/useTripData';
import { formatCurrency } from '../../../utils/currency';
import { DistanceUnit } from '../../../App';

interface SpeedChartsProps {
  data: TripStats;
  rows: CSVRow[];
  distanceUnit: DistanceUnit;
  activeCurrency: string | null;
  onFocusOnTrip: (tripRow: CSVRow) => void;
}

const CustomDistributionTooltip = ({ active, payload, label, unit }: TooltipProps<number, string> & { unit: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <p className="recharts-tooltip-label font-bold">{`Speed: ${label} ${unit}`}</p>
        <p className="recharts-tooltip-item text-purple-400">{`Trips: ${payload[0].value?.toLocaleString()}`}</p>
      </div>
    );
  }

  return null;
};

const CustomDayOfWeekTooltip = ({ active, payload, label, unit }: TooltipProps<number, string> & { unit: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <p className="recharts-tooltip-label font-bold">{`Day: ${label}`}</p>
        <p className="recharts-tooltip-item text-purple-400">{`Trips: ${payload[0].value?.toLocaleString()}`}</p>
      </div>
    );
  }

  return null;
};

const SpeedCharts: React.FC<SpeedChartsProps> = ({
  data,
  rows,
  distanceUnit,
  activeCurrency,
  onFocusOnTrip,
}) => {
  const {
    avgSpeed,
    fastestTripBySpeed,
    fastestTripBySpeedRow,
    slowestTripBySpeed,
    slowestTripBySpeedRow,
    costPerDurationByCurrency,
    avgSpeedByDayOfWeek,
  } = data;

  const speedDistributionData = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const speeds = rows
      .filter(r => r.status?.toLowerCase() === 'completed' && r.distance && parseFloat(r.distance) > 0 && r.begin_trip_time && r.dropoff_time)
      .map(r => {
        const durationHours = (new Date(r.dropoff_time).getTime() - new Date(r.begin_trip_time).getTime()) / (1000 * 60 * 60);
        if (durationHours <= 0) return null;
        return parseFloat(r.distance) / durationHours;
      })
      .filter((speed): speed is number => speed !== null && speed > 0);
    if (speeds.length === 0) return [];

    const maxSpeed = Math.max(...speeds);
    const bucketCount = 10;
    const bucketSize = Math.ceil(maxSpeed / bucketCount) || 1;

    const buckets = Array.from({ length: bucketCount }, () => 0);
    speeds.forEach(speed => {
      const bucketIndex = Math.min(Math.floor(speed / bucketSize), bucketCount - 1);
      buckets[bucketIndex]++;
    });

    return buckets.map((count, i) => ({
      name: `${i * bucketSize}-${(i + 1) * bucketSize}`,
      count,
    }));
  }, [rows, distanceUnit]);

  const dayOfWeekColors = ['#818cf8', '#60a5fa', '#38bdf8', '#22d3ee', '#34d399', '#a3e635', '#fde047'];

  return (
    <>
      <div className="stats-group">
        <h3>Ride Speed Distribution</h3>
        {speedDistributionData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={speedDistributionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} unit={distanceUnit === 'miles' ? ' mph' : ' km/h'} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomDistributionTooltip unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
              <Bar dataKey="count" fill="#a78bfa" name="Number of Trips" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 w-full mt-4">
          <Stat label="Avg. Speed" value={avgSpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} />
          <Stat label="Fastest" value={fastestTripBySpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} onClick={() => fastestTripBySpeedRow && onFocusOnTrip(fastestTripBySpeedRow)} />
          <Stat label="Slowest" value={slowestTripBySpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} onClick={() => slowestTripBySpeedRow && onFocusOnTrip(slowestTripBySpeedRow)} />
        </div>
      </div>
      {avgSpeedByDayOfWeek.length > 0 && (
        <div className="stats-group">
          <h3>Average Speed by Day of Week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={avgSpeedByDayOfWeek} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="day" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} unit={distanceUnit === 'miles' ? ' mph' : ' km/h'} />
              <Tooltip content={<CustomDayOfWeekTooltip unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
              <Bar dataKey="avgSpeed" name="Average Speed" radius={[4, 4, 0, 0]}>
                {avgSpeedByDayOfWeek.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={dayOfWeekColors[index % dayOfWeekColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
};

export default SpeedCharts;