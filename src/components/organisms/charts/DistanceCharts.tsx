import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import Stat from '../../atoms/Stat';
import { CSVRow } from '../../../services/csvParser';
import { TripStats } from '../../../hooks/useTripData';
import { formatCurrency } from '../../../utils/currency';
import { DistanceUnit } from '../../../App';

interface DistanceChartsProps {
  data: TripStats;
  rows: CSVRow[];
  distanceUnit: DistanceUnit;
  activeCurrency: string | null;
  onFocusOnTrip: (tripRow: CSVRow) => void;
}

const DistanceCharts: React.FC<DistanceChartsProps> = ({
  data,
  rows,
  distanceUnit,
  activeCurrency,
  onFocusOnTrip,
}) => {
  const {
    totalCompletedDistance,
    avgCompletedDistance,
    longestTripByDist,
    longestTripByDistRow,
    shortestTripByDist,
    shortestTripByDistRow,
    costPerDistanceByCurrency,
  } = data;

  const distanceDistributionData = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const distances = rows
      .filter(r => r.status?.toLowerCase() === 'completed' && r.distance && parseFloat(r.distance) > 0)
      .map(r => parseFloat(r.distance));
    if (distances.length === 0) return [];

    const maxDistance = Math.max(...distances);
    const bucketCount = 10;
    const bucketSize = Math.ceil(maxDistance / bucketCount) || 1;

    const buckets = Array.from({ length: bucketCount }, () => 0);
    distances.forEach(distance => {
      const bucketIndex = Math.min(Math.floor(distance / bucketSize), bucketCount - 1);
      buckets[bucketIndex]++;
    });

    return buckets.map((count, i) => ({
      name: `${(i * bucketSize).toFixed(1)}-${((i + 1) * bucketSize).toFixed(1)} ${distanceUnit}`,
      count,
    }));
  }, [rows, distanceUnit]);

  return (
    <div className="stats-group">
      <h3>Distance</h3>
      {distanceDistributionData.length > 0 && (
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distanceDistributionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ff8042" name="Number of Trips" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="stats-grid four-col mt-4">
        <Stat label="Total Distance" value={totalCompletedDistance.toFixed(2)} unit={distanceUnit} />
        <Stat label="Avg. Distance" value={avgCompletedDistance.toFixed(2)} unit={distanceUnit} />
        <Stat label="Longest" value={longestTripByDist.toFixed(2)} unit={distanceUnit} onClick={() => longestTripByDistRow && onFocusOnTrip(longestTripByDistRow)} />
        <Stat label="Shortest" value={shortestTripByDist.toFixed(2)} unit={distanceUnit} onClick={() => shortestTripByDistRow && onFocusOnTrip(shortestTripByDistRow)} />
        {activeCurrency && costPerDistanceByCurrency[activeCurrency] !== undefined && (
          <Stat
            label={`Cost per ${distanceUnit}`}
            value={`${formatCurrency(costPerDistanceByCurrency[activeCurrency]!, activeCurrency)}/${distanceUnit}`}
          />
        )}
      </div>
    </div>
  );
};

export default DistanceCharts;