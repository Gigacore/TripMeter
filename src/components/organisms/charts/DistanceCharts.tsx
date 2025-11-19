import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, TooltipProps } from 'recharts';
import { timeFormat } from 'd3-time-format';
import Stat from '../../atoms/Stat';
import { CSVRow } from '../../../services/csvParser';
import { TripStats } from '../../../hooks/useTripData';
import { formatCurrency } from '../../../utils/currency';
import { DistanceUnit } from '../../../App';

import RequestsMapModal from '../RequestsMapModal';
import { Map, Globe, Moon, Sun, Landmark, Rocket } from 'lucide-react';
import { FunFact } from '../../molecules/FunFact';
import { calculateDistanceFacts } from '../../../utils/funFacts';

interface DistanceChartsProps {
  data: TripStats;
  rows: CSVRow[];
  distanceUnit: DistanceUnit;
  activeCurrency: string | null;
  onFocusOnTrips: (tripRows: CSVRow[], title?: string) => void;
  convertDistance: (miles: number) => number;
}

// HACK: Using `any` to bypass a type issue with recharts TooltipProps.
const CustomTooltip = (props: any) => {
  const { active, payload, label } = props;
  if (active && payload && payload.length) {
    return (
      <div className="min-w-[200px] rounded-lg border bg-background/80 p-4 text-sm text-foreground shadow-lg backdrop-blur-sm border-border">
        <div className="mb-2 border-b border-border pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{`Distance: ${label}`}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="text-muted-foreground">Trips</div>
          <div className="font-medium text-right text-orange-400">{payload[0].value?.toLocaleString()}</div>
        </div>
      </div>
    );
  }

  return null;
};

const formatDate = timeFormat('%b %d, %Y');

// HACK: Using `any` to bypass a type issue with recharts TooltipProps.
const CustomYearTooltip = (props: any) => {
  const { active, payload, label, distanceUnit } = props;
  if (active && payload && payload.length) {
    return (
      <div className="min-w-[200px] rounded-lg border bg-background/80 p-4 text-sm text-foreground shadow-lg backdrop-blur-sm border-border">
        <div className="mb-2 border-b border-border pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{`Year: ${label}`}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="text-muted-foreground font-medium">Total Distance</div>
          <div className="font-medium text-right text-orange-400">{payload[0].value?.toLocaleString()} {distanceUnit}</div>
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
  onFocusOnTrips,
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

  const distanceDistributionData = useMemo(() => {
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
    <div className="grid grid-cols-1 gap-6">
      <div className="stats-group">
        {/* <h3 className="text-lg font-semibold mb-2">Ride Distance Distribution</h3> */}
        {distanceDistributionData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={distanceDistributionData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis type="number" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} width={120} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
              <Bar dataKey="count" fill="#fb923c" name="Number of Trips" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {data.tripsByYear && data.tripsByYear.length > 0 && (
        <div className="stats-group">
          <h3 className="text-lg font-semibold">Total Distance by Year ({distanceUnit})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.tripsByYear} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="year" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value as number).toLocaleString()}`} />
              <Tooltip content={<CustomYearTooltip distanceUnit={distanceUnit} />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
              <Bar dataKey="totalDistance" fill="#fb923c" name={`Distance (${distanceUnit})`} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 w-full mt-4">
        <Stat label="Total Distance" value={totalCompletedDistance.toFixed(2)} unit={distanceUnit} />
        <Stat label="Avg. Distance" value={avgCompletedDistance.toFixed(2)} unit={distanceUnit} />

        {longestTripByDistRow ? (
          <RequestsMapModal
            rows={[longestTripByDistRow]}
            distanceUnit={distanceUnit}
            convertDistance={convertDistance}
            title="Farthest Trip"
            renderTripStat={(trip) => (
              <div className="text-xs font-medium text-orange-600 dark:text-orange-400">
                Distance: {convertDistance(parseFloat(trip.distance || '0')).toFixed(2)} {distanceUnit}
              </div>
            )}
          >
            <div className="cursor-pointer hover:bg-muted transition-colors duration-200 rounded-lg">
              <Stat
                label="Farthest"
                value={longestTripByDist.toFixed(2)}
                unit={distanceUnit}
                valueIcon={<Map size={16} />}
              />
            </div>
          </RequestsMapModal>
        ) : (
          <Stat label="Farthest" value={longestTripByDist.toFixed(2)} unit={distanceUnit} />
        )}

        {shortestTripByDistRow ? (
          <RequestsMapModal
            rows={[shortestTripByDistRow]}
            distanceUnit={distanceUnit}
            convertDistance={convertDistance}
            title="Shortest Trip"
            renderTripStat={(trip) => (
              <div className="text-xs font-medium text-orange-600 dark:text-orange-400">
                Distance: {convertDistance(parseFloat(trip.distance || '0')).toFixed(2)} {distanceUnit}
              </div>
            )}
          >
            <div className="cursor-pointer hover:bg-muted transition-colors duration-200 rounded-lg">
              <Stat
                label="Shortest"
                value={shortestTripByDist.toFixed(2)}
                unit={distanceUnit}
                valueIcon={<Map size={16} />}
              />
            </div>
          </RequestsMapModal>
        ) : (
          <Stat label="Shortest" value={shortestTripByDist.toFixed(2)} unit={distanceUnit} />
        )}

        {activeCurrency && costPerDistanceByCurrency[activeCurrency] !== undefined && (
          <Stat
            label={`Cost per ${distanceUnit}`}
            value={`${formatCurrency(costPerDistanceByCurrency[activeCurrency]!, activeCurrency)}/${distanceUnit}`}
          />
        )}
      </div>

      <div className="mt-8">
        <h4 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Distance Fun Facts
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {calculateDistanceFacts(distanceUnit === 'miles' ? totalCompletedDistance : convertDistance(totalCompletedDistance)).map((fact, index) => {
            const Icon = fact.iconName === 'Landmark' ? Landmark : fact.iconName === 'Rocket' ? Rocket : Map;
            return (
              <FunFact
                key={index}
                label={fact.label}
                value={fact.value}
                icon={Icon}
                description={fact.description}
                gradient={fact.gradient}
                textColor={fact.textColor}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DistanceCharts;
