
import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, TooltipProps } from 'recharts';
import { Map, Film, Briefcase, Calendar, Rocket, Music, Clock } from 'lucide-react';
import Stat from '../../atoms/Stat';
import { FunFact } from '../../molecules/FunFact';
import { calculateDurationFacts } from '../../../utils/funFacts';
import { formatDuration, formatDurationWithSeconds } from '../../../utils/formatters';
import { CSVRow } from '../../../services/csvParser';
import { TripStats } from '../../../hooks/useTripData';
import RequestsMapModal from '../RequestsMapModal';
import { DistanceUnit } from '../../../App';

import TripDurationDistribution from './TripDurationDistribution';

interface DurationChartsProps {
  data: TripStats;
  rows: CSVRow[];
  onShowTripList: (type: string, trips?: CSVRow[]) => void;
  onFocusOnTrips: (tripRows: CSVRow[], title?: string) => void;
  distanceUnit: DistanceUnit;
  convertDistance: (miles: number) => number;
}

// HACK: Using `any` to bypass a type issue with recharts TooltipProps.
const CustomTooltip = (props: any) => {
  const { active, payload, label } = props;
  if (active && payload && payload.length) {
    return (
      <div className="min-w-[200px] rounded-lg border bg-background/80 p-4 text-sm text-foreground shadow-lg backdrop-blur-sm border-border">
        <div className="mb-2 border-b border-border pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{`Duration: ${label} `}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="text-muted-foreground">Trips</div>
          <div className="font-medium text-right text-sky-400">{payload[0].value?.toLocaleString()}</div>
        </div>
      </div>
    );
  }

  return null;
};

const DurationCharts: React.FC<DurationChartsProps> = ({
  data,
  rows,
  onShowTripList,
  onFocusOnTrips,
  distanceUnit,
  convertDistance,
}) => {
  const {
    totalTripDuration,
    avgTripDuration,
    longestTrip,
    longestTripRow,
    shortestTrip,
    shortestTripRow,
  } = data;

  const durationDistributionData = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const durations = rows
      .filter(r => r.status?.toLowerCase() === 'completed' && r.begin_trip_time && r.dropoff_time)
      .map(r => (new Date(r.dropoff_time).getTime() - new Date(r.begin_trip_time).getTime()) / (1000 * 60)) // in minutes
      .filter(d => d > 0);
    if (durations.length === 0) return [];

    const maxDuration = Math.max(...durations);
    const bucketCount = 10;
    const bucketSize = Math.ceil(maxDuration / bucketCount) || 1;

    const buckets = Array.from({ length: bucketCount }, () => 0);
    durations.forEach(duration => {
      const bucketIndex = Math.min(Math.floor(duration / bucketSize), bucketCount - 1);
      buckets[bucketIndex]++;
    });

    return buckets.map((count, i) => ({
      name: `${i * bucketSize} -${(i + 1) * bucketSize} min`,
      count,
    }));
  }, [rows]);

  return (
    <div className="stats-group">
      {durationDistributionData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={durationDistributionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
            <Bar dataKey="count" fill="#38bdf8" name="Number of Trips" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 w-full mt-4">
        <Stat label="Total Duration" value={formatDuration(totalTripDuration, true)} />
        <Stat label="Average Duration" value={formatDurationWithSeconds(avgTripDuration)} />

        {longestTripRow ? (
          <RequestsMapModal
            rows={[longestTripRow]}
            distanceUnit={distanceUnit}
            convertDistance={convertDistance}
            title="Longest Ride Duration"
            renderTripStat={(trip) => (
              <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Duration: {formatDurationWithSeconds((new Date(trip.dropoff_time!).getTime() - new Date(trip.begin_trip_time!).getTime()) / (1000 * 60))}
              </div>
            )}
          >
            <div className="cursor-pointer hover:bg-muted transition-colors duration-200 rounded-lg">
              <Stat
                label="Longest"
                value={formatDurationWithSeconds(longestTrip)}
                valueIcon={<Map size={16} />}
              />
            </div>
          </RequestsMapModal>
        ) : (
          <Stat label="Longest" value={formatDurationWithSeconds(longestTrip)} />
        )}

        {shortestTripRow ? (
          <RequestsMapModal
            rows={[shortestTripRow]}
            distanceUnit={distanceUnit}
            convertDistance={convertDistance}
            title="Shortest Ride Duration"
            renderTripStat={(trip) => (
              <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Duration: {formatDurationWithSeconds((new Date(trip.dropoff_time!).getTime() - new Date(trip.begin_trip_time!).getTime()) / (1000 * 60))}
              </div>
            )}
          >
            <div className="cursor-pointer hover:bg-muted transition-colors duration-200 rounded-lg">
              <Stat
                label="Shortest"
                value={formatDurationWithSeconds(shortestTrip)}
                valueIcon={<Map size={16} />}
              />
            </div>
          </RequestsMapModal>
        ) : (
          <Stat label="Shortest" value={formatDurationWithSeconds(shortestTrip)} />
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="text-sm font-semibold mb-4">Trip Duration Distribution</h4>
        <TripDurationDistribution rows={rows} />
      </div>

      <div className="my-8 border-t border-border" />
      <div className="mt-8">
        <h4 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Time Fun Facts
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {calculateDurationFacts(totalTripDuration).map((fact, index) => {
            const Icon = fact.iconName === 'Rocket' ? Rocket : fact.iconName === 'Music' ? Music : Film;
            return (
              <FunFact
                key={index}
                label={fact.label}
                value={fact.value}
                icon={Icon}
                description={fact.description}
                gradient={fact.gradient}
                textColor={fact.textColor}
                baseFact={fact.baseFact}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DurationCharts;
