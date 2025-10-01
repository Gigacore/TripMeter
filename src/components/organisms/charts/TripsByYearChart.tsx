import React from 'react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, TooltipProps } from 'recharts';
import { TripStats } from '../../../hooks/useTripData';

interface TripsByYearChartProps {
  data: TripStats;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <p className="recharts-tooltip-label font-bold">{`Year: ${label}`}</p>
        <p className="recharts-tooltip-item text-emerald-400">{`Trips: ${payload[0].value?.toLocaleString()}`}</p>
      </div>
    );
  }

  return null;
};

const TripsByYearChart: React.FC<TripsByYearChartProps> = ({ data }) => {
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
          <Area type="monotone" dataKey="count" stroke="#34d399" fillOpacity={1} fill="url(#colorTrips)" name="Trips" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TripsByYearChart;