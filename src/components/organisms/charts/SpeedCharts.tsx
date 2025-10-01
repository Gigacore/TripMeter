import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
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
  }, [rows]);

  return (
    <div className="stats-group">
      <h3>Speed</h3>
      {speedDistributionData.length > 0 && (
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={speedDistributionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8dd1e1" name="Number of Trips" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="stats-grid four-col mt-4">
        <Stat label="Avg. Speed" value={avgSpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} />
        <Stat label="Fastest" value={fastestTripBySpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} onClick={() => fastestTripBySpeedRow && onFocusOnTrip(fastestTripBySpeedRow)} />
        <Stat label="Slowest" value={slowestTripBySpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} onClick={() => slowestTripBySpeedRow && onFocusOnTrip(slowestTripBySpeedRow)} />
        {activeCurrency && costPerDurationByCurrency[activeCurrency] !== undefined && (
          <Stat
            label="Cost per Minute"
            value={formatCurrency(costPerDurationByCurrency[activeCurrency]!, activeCurrency)}
          />
        )}
      </div>
    </div>
  );
};

export default SpeedCharts;