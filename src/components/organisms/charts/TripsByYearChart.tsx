import React from 'react';
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, TooltipProps, BarChart, Bar } from 'recharts';
import { TripStats } from '../../../hooks/useTripData';
import { DistanceUnit } from '../../../App';
import { formatCurrency } from '../../../utils/currency';
import { formatDuration } from '../../../utils/formatters';
import { CSVRow } from '@/services/csvParser';

interface TripsByYearChartProps {
  data: TripStats;
  rows: CSVRow[];
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
      <div className="min-w-[250px] rounded-lg border border-slate-700 bg-slate-800/80 p-4 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <div className="mb-2 border-b border-slate-700 pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{`Year: ${label}`}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="text-slate-400 text-emerald-400">Trips</div><div className="font-medium text-right text-emerald-400">{count.toLocaleString()}</div>
          <div className="text-slate-400">Distance Traveled</div><div className="font-medium text-right">{totalDistance.toFixed(2)} {distanceUnit}</div>
          {activeCurrency && totalFare[activeCurrency] && <><div className="text-slate-400">Total Fare</div><div className="font-medium text-right">{formatCurrency(totalFare[activeCurrency], activeCurrency)}</div></>}
          <div className="text-slate-400">Riding Time</div><div className="font-medium text-right">{formatDuration(totalRidingTime, true)}</div>
          <div className="text-slate-400">Waiting Time</div><div className="font-medium text-right">{formatDuration(totalWaitingTime, true)}</div>
          <div className="text-slate-400">Farthest Trip</div><div className="font-medium text-right">{farthestTrip.toFixed(2)} {distanceUnit}</div>
          {isFinite(shortestTrip) && <><div className="text-slate-400">Shortest Trip</div><div className="font-medium text-right">{shortestTrip.toFixed(2)} {distanceUnit}</div></>}
          {activeCurrency && highestFare[activeCurrency] !== undefined && <><div className="text-slate-400">Highest Fare</div><div className="font-medium text-right">{formatCurrency(highestFare[activeCurrency], activeCurrency)}</div></>}
          {activeCurrency && lowestFare[activeCurrency] !== undefined && <><div className="text-slate-400">Lowest Fare</div><div className="font-medium text-right">{formatCurrency(lowestFare[activeCurrency], activeCurrency)}</div></>}
        </div>
      </div>
    );
  }
  return null;
};

const TripsByYearChart: React.FC<TripsByYearChartProps> = ({ data, distanceUnit, activeCurrency }) => {
  const [metric, setMetric] = React.useState<'count' | 'totalDistance'>('count');
  const { tripsByYear } = data;

  if (tripsByYear.length === 0) return null;

  const metricOptions = [
    { value: 'count', label: 'Total Trips' },
    { value: 'totalDistance', label: 'Total Distance' },
  ];

  const chartColor = {
    count: '#34d399', // emerald
    totalDistance: '#fb923c', // orange
  }[metric];

  const dataKey = metric;

  const yAxisTickFormatter = (value: number) =>
    value.toLocaleString();

  return (
    <>
      <div className="stats-group">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={tripsByYear}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis
            dataKey="year"
            stroke="#888"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={yAxisTickFormatter} />
          <Tooltip content={<CustomTooltip distanceUnit={distanceUnit} activeCurrency={activeCurrency} />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
          <Bar dataKey={dataKey} fill={chartColor} name={metricOptions.find(m => m.value === metric)?.label} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 mt-4">
        {metricOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setMetric(option.value)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors rounded-md disabled:cursor-not-allowed disabled:opacity-50 ${
              metric === option.value
                ? 'bg-slate-700 text-slate-100'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
    </>
  );
};

export default TripsByYearChart;