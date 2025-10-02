import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, TooltipProps } from 'recharts';
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

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="min-w-[200px] rounded-lg border border-slate-700 bg-slate-800/80 p-4 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <div className="mb-2 border-b border-slate-700 pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{`Distance: ${label}`}</p>
        </div>
        <div className="text-slate-400">Trips</div>
        <div className="font-medium text-orange-400 text-lg">{payload[0].value?.toLocaleString()}</div>
      </div>
    );
  }

  return null;
};

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
      <h3 className="mb-2">Ride Distance Distribution</h3>
      {distanceDistributionData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart layout="vertical" data={distanceDistributionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis type="number" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} width={120} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
            <Bar dataKey="count" fill="#fb923c" name="Number of Trips" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 w-full mt-4">
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