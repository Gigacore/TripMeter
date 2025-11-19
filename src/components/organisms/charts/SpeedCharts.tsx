import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, TooltipProps, Cell } from 'recharts';
import { Map } from 'lucide-react';
import RequestsMapModal from '../RequestsMapModal';
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
  onFocusOnTrips: (tripRows: CSVRow[], title?: string) => void;
  convertDistance: (miles: number) => number;
}

const CustomDistributionTooltip = ({ active, payload, label, unit }: TooltipProps<number, string> & { unit: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="min-w-[200px] rounded-lg border bg-background/80 p-4 text-sm text-foreground shadow-lg backdrop-blur-sm border-border">
        <div className="mb-2 border-b border-border pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{`Avg. Speed: ${label} ${unit}`}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="text-muted-foreground">Trips</div>
          <div className="font-medium text-right text-purple-400">{payload[0].value?.toLocaleString()}</div>
        </div>
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
  onFocusOnTrips,
  convertDistance,
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
    <div className="grid grid-cols-1 gap-6">
      <div className="stats-group">
        {speedDistribution.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              layout="vertical"
              data={speedDistribution}
              margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} unit={distanceUnit === 'miles' ? ' mph' : ' km/h'} width={100} />
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
          <Stat label="Overall Avg. Speed" value={avgSpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} />

          {fastestTripBySpeedRow ? (
            <RequestsMapModal
              rows={[fastestTripBySpeedRow]}
              distanceUnit={distanceUnit}
              convertDistance={convertDistance}
              title="Fastest Trip"
              renderTripStat={(trip) => {
                const distance = parseFloat(trip.distance);
                const begin = new Date(trip.begin_trip_time);
                const dropoff = new Date(trip.dropoff_time);
                let speed = 0;

                if (!isNaN(distance) && !isNaN(begin.getTime()) && !isNaN(dropoff.getTime())) {
                  const durationHours = (dropoff.getTime() - begin.getTime()) / (1000 * 60 * 60);
                  if (durationHours > 0) {
                    speed = convertDistance(distance) / durationHours;
                  }
                }

                return (
                  <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Speed: {speed.toFixed(2)} {distanceUnit === 'miles' ? 'mph' : 'km/h'}
                  </div>
                );
              }}
            >
              <div className="cursor-pointer hover:bg-muted transition-colors duration-200 rounded-lg">
                <Stat
                  label="Fastest Trip"
                  value={fastestTripBySpeed.toFixed(2)}
                  unit={distanceUnit === 'miles' ? 'mph' : 'km/h'}
                  subValue={
                    <span className="flex items-center justify-center gap-1 text-blue-500 hover:underline">
                      <Map size={12} /> View on map
                    </span>
                  }
                />
              </div>
            </RequestsMapModal>
          ) : (
            <Stat label="Fastest Trip" value={fastestTripBySpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} />
          )}

          {slowestTripBySpeedRow ? (
            <RequestsMapModal
              rows={[slowestTripBySpeedRow]}
              distanceUnit={distanceUnit}
              convertDistance={convertDistance}
              title="Slowest Trip"
              renderTripStat={(trip) => {
                const distance = parseFloat(trip.distance);
                const begin = new Date(trip.begin_trip_time);
                const dropoff = new Date(trip.dropoff_time);
                let speed = 0;

                if (!isNaN(distance) && !isNaN(begin.getTime()) && !isNaN(dropoff.getTime())) {
                  const durationHours = (dropoff.getTime() - begin.getTime()) / (1000 * 60 * 60);
                  if (durationHours > 0) {
                    speed = convertDistance(distance) / durationHours;
                  }
                }

                return (
                  <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Speed: {speed.toFixed(2)} {distanceUnit === 'miles' ? 'mph' : 'km/h'}
                  </div>
                );
              }}
            >
              <div className="cursor-pointer hover:bg-muted transition-colors duration-200 rounded-lg">
                <Stat
                  label="Slowest Trip"
                  value={slowestTripBySpeed.toFixed(2)}
                  unit={distanceUnit === 'miles' ? 'mph' : 'km/h'}
                  subValue={
                    <span className="flex items-center justify-center gap-1 text-blue-500 hover:underline">
                      <Map size={12} /> View on map
                    </span>
                  }
                />
              </div>
            </RequestsMapModal>
          ) : (
            <Stat label="Slowest Trip" value={slowestTripBySpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeedCharts;
