import React from 'react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { TripStats } from '../../../hooks/useTripData';

interface TripsByYearChartProps {
  data: TripStats;
}

const TripsByYearChart: React.FC<TripsByYearChartProps> = ({ data }) => {
  const { tripsByYear } = data;

  if (tripsByYear.length === 0) return null;

  return (
    <div className="stats-group">
      <h3>Trips by Year</h3>
      <p className="hint -mt-2 mb-4">Total completed trips each year.</p>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={tripsByYear}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="count" stroke="#8884d8" fillOpacity={1} fill="url(#colorTrips)" name="Trips" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TripsByYearChart;