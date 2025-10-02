import React from 'react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, TooltipProps } from 'recharts';
import { TripStats } from '../../../hooks/useTripData';
import { DistanceUnit } from '../../../App';
import { formatCurrency } from '../../../utils/currency';
import { formatDuration } from '../../../utils/formatters';

interface TripsByYearChartProps {
  data: TripStats;
  distanceUnit: DistanceUnit;
  activeCurrency: string | null;
}

const CustomTooltip = ({ active, payload, label, distanceUnit, activeCurrency }: TooltipProps<number, string> & { distanceUnit: DistanceUnit, activeCurrency: string | null }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const {
      count,
      totalDistance,
      totalFare,
      totalRidingTime,
      totalWaitingTime,
      farthestTrip,
      shortestTrip,
      highestFare,
      lowestFare,
    } = data;

    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <p className="recharts-tooltip-label font-bold">{`Year: ${label}`}</p>
        <ul className="mt-2 space-y-1">
          <li className="recharts-tooltip-item text-emerald-400">{`Trips: ${count.toLocaleString()}`}</li>
          <li className="recharts-tooltip-item">Distance Traveled: {totalDistance.toFixed(2)} {distanceUnit}</li>
          {activeCurrency && totalFare[activeCurrency] && <li className="recharts-tooltip-item">Total Fare: {formatCurrency(totalFare[activeCurrency], activeCurrency)}</li>}
          <li className="recharts-tooltip-item">Riding Time: {formatDuration(totalRidingTime, true)}</li>
          <li className="recharts-tooltip-item">Waiting Time: {formatDuration(totalWaitingTime, true)}</li>
          <li className="recharts-tooltip-item">Farthest Trip: {farthestTrip.toFixed(2)} {distanceUnit}</li>
          {isFinite(shortestTrip) && <li className="recharts-tooltip-item">Shortest Trip: {shortestTrip.toFixed(2)} {distanceUnit}</li>}
          {activeCurrency && highestFare[activeCurrency] !== undefined && <li className="recharts-tooltip-item">Highest Fare: {formatCurrency(highestFare[activeCurrency], activeCurrency)}</li>}
          {activeCurrency && lowestFare[activeCurrency] !== undefined && <li className="recharts-tooltip-item">Lowest Fare: {formatCurrency(lowestFare[activeCurrency], activeCurrency)}</li>}
        </ul>
      </div>
    );
  }
  return null;
};

const TripsByYearChart: React.FC<TripsByYearChartProps> = ({ data, distanceUnit, activeCurrency }) => {
  const { tripsByYear } = data;

  if (tripsByYear.length === 0) return null;

  return (
    <div className="stats-group">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={tripsByYear}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis
            dataKey="year"
            stroke="#888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
          <Tooltip content={<CustomTooltip distanceUnit={distanceUnit} activeCurrency={activeCurrency} />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
          <Area type="monotone" dataKey="count" stroke="#34d399" fillOpacity={1} fill="url(#colorTrips)" name="Trips" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TripsByYearChart;