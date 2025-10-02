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
      <div className="min-w-[200px] rounded-lg border border-slate-700 bg-slate-800/80 p-4 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <div className="mb-2 border-b border-slate-700 pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{`Avg. Speed: ${label} ${unit}`}</p>
        </div>
        <div className="text-slate-400">Trips</div>
        <div className="font-medium text-purple-400 text-lg">{payload[0].value?.toLocaleString()}</div>
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
    speedDistribution,
  } = data;
  
  const getBarColor = (index: number) => {
    const percentage = (index / (speedDistribution.length - 1)) * 100;
    if (percentage < 33) {
      return '#34d399'; // green for slowest
    }
    if (percentage < 66) {
      return '#facc15'; // yellow for mid
    }
    return '#ef4444'; // red for fastest
  };

  return (
    <>
      <div className="stats-group">
        <h3 className="mb-2">Average Ride Speed Distribution</h3>
        {speedDistribution.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              layout="vertical"
              data={speedDistribution}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis type="number" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} unit={distanceUnit === 'miles' ? ' mph' : ' km/h'} width={80} />
              <Tooltip content={<CustomDistributionTooltip unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
              <Bar dataKey="count" name="Number of Trips" radius={[0, 4, 4, 0]}>
                {speedDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 w-full mt-4">
          <Stat label="Overall Avg. Speed" value={avgSpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} />
          <Stat label="Fastest Trip" value={fastestTripBySpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} onClick={() => fastestTripBySpeedRow && onFocusOnTrip(fastestTripBySpeedRow)} />
          <Stat label="Slowest Trip" value={slowestTripBySpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} onClick={() => slowestTripBySpeedRow && onFocusOnTrip(slowestTripBySpeedRow)} />
        </div>
      </div>
    </>
  );
};

export default SpeedCharts;