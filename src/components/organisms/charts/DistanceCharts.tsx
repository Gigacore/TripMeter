import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, TooltipProps, AreaChart, Area } from 'recharts';
import { timeFormat } from 'd3-time-format';
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
  convertDistance: (miles: number) => number;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="min-w-[200px] rounded-lg border border-slate-700 bg-slate-800/80 p-4 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <div className="mb-2 border-b border-slate-700 pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{`Distance: ${label}`}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="text-slate-400">Trips</div>
          <div className="font-medium text-right text-orange-400">{payload[0].value?.toLocaleString()}</div>
        </div>
      </div>
    );
  }

  return null;
};

const formatDate = timeFormat('%b %d, %Y');

const CustomAreaTooltip = ({ active, payload, distanceUnit }: TooltipProps<number, string> & { distanceUnit: DistanceUnit }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="min-w-[200px] rounded-lg border border-slate-700 bg-slate-800/80 p-4 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <div className="mb-2 border-b border-slate-700 pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{formatDate(new Date(data.date))}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="text-slate-400 text-orange-400">Total Distance</div>
          <div className="font-medium text-right text-orange-400">{data.cumulativeDistance.toFixed(2)} {distanceUnit}</div>
        </div>
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
  convertDistance,
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

  const cumulativeDistanceData = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];

    const completedTrips = rows
      .filter(r => r.status?.toLowerCase() === 'completed' && r.distance && parseFloat(r.distance) > 0 && r.request_time)
      .map(r => ({
        date: new Date(r.request_time),
        distance: convertDistance(parseFloat(r.distance)),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (completedTrips.length === 0) return [];

    let cumulativeDistance = 0;
    return completedTrips.map(trip => {
      cumulativeDistance += trip.distance;
      return {
        date: trip.date.getTime(),
        cumulativeDistance: cumulativeDistance,
      };
    });
  }, [rows, convertDistance]);

  return (
    <>
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
      {data.tripsByYear && data.tripsByYear.length > 0 && (
        <div className="stats-group">
          <h3>Total Distance by Year ({distanceUnit})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.tripsByYear} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="year" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value as number).toLocaleString()}`} />
              <Tooltip content={<CustomAreaTooltip distanceUnit={distanceUnit} />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
              <Bar dataKey="totalDistance" fill="#fb923c" name={`Distance (${distanceUnit})`} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {cumulativeDistanceData && cumulativeDistanceData.length > 0 && (
        <div className="stats-group">
          <h3>Cumulative Distance Over Time ({distanceUnit})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={cumulativeDistanceData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCumulativeDistance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin', 'dataMax']} type="number" tickFormatter={(unixTime) => formatDate(new Date(unixTime))} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value as number).toLocaleString()}`} />
              <Tooltip content={<CustomAreaTooltip distanceUnit={distanceUnit} />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
              <Area type="monotone" dataKey="cumulativeDistance" stroke="#fb923c" fillOpacity={1} fill="url(#colorCumulativeDistance)" name={`Distance (${distanceUnit})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
};

export default DistanceCharts;