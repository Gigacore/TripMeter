import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Treemap, TooltipProps } from 'recharts';
import Stat from '../../atoms/Stat';
import { formatDuration, formatDurationWithSeconds } from '../../../utils/formatters';
import { CSVRow } from '../../../services/csvParser';
import { TripStats } from '../../../hooks/useTripData';

interface WaitingTimeChartsProps {
  data: TripStats;
  rows: CSVRow[];
  onFocusOnTrip: (tripRow: CSVRow) => void;
}

const CustomBarTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <p className="recharts-tooltip-label font-bold">{`Waiting Time: ${label}`}</p>
        <p className="recharts-tooltip-item text-amber-400">{`Trips: ${payload[0].value?.toLocaleString()}`}</p>
      </div>
    );
  }

  return null;
};

const CustomTreemapTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <p className="recharts-tooltip-label font-bold">{name}</p>
        <p className="recharts-tooltip-item text-slate-300">{`Duration: ${formatDuration(value as number, true)}`}</p>
      </div>
    );
  }
  return null;
};

const WaitingTimeCharts: React.FC<WaitingTimeChartsProps> = ({
  data,
  rows,
  onFocusOnTrip,
}) => {
  const {
    totalWaitingTime,
    avgWaitingTime,
    longestWaitingTime,
    longestWaitingTimeRow,
    shortestWaitingTime,
    shortestWaitingTimeRow,
    totalTripDuration,
    successfulTrips,
    waitingLongerThanTripCount,
    totalWaitingTimeForLongerWaits,
    totalRidingTimeForLongerWaits,
  } = data;

  const waitingTimeDistributionData = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const waitingTimes = rows
      .filter(r => r.status?.toLowerCase() === 'completed' && r.request_time && r.begin_trip_time)
      .map(r => (new Date(r.begin_trip_time).getTime() - new Date(r.request_time).getTime()) / (1000 * 60)) // in minutes
      .filter(d => d > 0);
    if (waitingTimes.length === 0) return [];

    const maxWaitingTime = Math.max(...waitingTimes);
    const bucketCount = 10;
    const bucketSize = Math.ceil(maxWaitingTime / bucketCount) || 1;

    const buckets = Array.from({ length: bucketCount }, () => 0);
    waitingTimes.forEach(waitingTime => {
      const bucketIndex = Math.min(Math.floor(waitingTime / bucketSize), bucketCount - 1);
      buckets[bucketIndex]++;
    });

    return buckets.map((count, i) => ({
      name: `${i * bucketSize}-${(i + 1) * bucketSize} min`,
      count,
    }));
  }, [rows]);

  const treemapColors = React.useMemo(() => ['#a78bfa', '#34d399'], []);

  const renderWaitingTreemapContent = React.useCallback((props: any, totalTrips: number) => {
    const { depth, x, y, width, height, index, name, value } = props;
    const isSmall = width < 150 || height < 50;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: treemapColors[index % treemapColors.length],
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {depth === 1 && !isSmall ? (
          <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={14}>
            <tspan x={x + width / 2} dy="-0.5em" className="font-semibold">{name}</tspan>
            <tspan x={x + width / 2} dy="1.2em">{formatDuration(value, true)}</tspan>
          </text>
        ) : null}
        {depth === 1 && isSmall ? (
          <text x={x + 4} y={y + 18} fill="#fff" fontSize={12} fillOpacity={0.9}>{name}</text>
        ) : null}
      </g>
    );
  }, [treemapColors]);

  return (
    <>
      <div className="stats-group">
        <h3 className="mb-2">Waiting Time Distribution</h3>
        {waitingTimeDistributionData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={waitingTimeDistributionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
              <Bar dataKey="count" fill="#facc15" name="Number of Trips" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 w-full mt-4">
          <Stat label="Total" value={formatDuration(totalWaitingTime, true)} />
          <Stat label="Average" value={formatDurationWithSeconds(avgWaitingTime)} />
          <Stat label="Longest" value={formatDurationWithSeconds(longestWaitingTime)} onClick={() => longestWaitingTimeRow && onFocusOnTrip(longestWaitingTimeRow)} />
          <Stat label="Shortest" value={formatDurationWithSeconds(shortestWaitingTime)} onClick={() => shortestWaitingTimeRow && onFocusOnTrip(shortestWaitingTimeRow)} />
        </div>
      </div>
      {totalWaitingTime > 0 && totalTripDuration > 0 && (
        <div className="stats-group">
          <h3>Waiting vs. Riding</h3>
          <div className="flex flex-col items-center gap-4">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height={200}>
                <Treemap
                  data={[
                    { name: 'Total Waiting Time', size: totalWaitingTime },
                    { name: 'Total Riding Time', size: totalTripDuration },
                  ]}
                  dataKey="size"
                  stroke="#fff"
                  content={(props) => renderWaitingTreemapContent(props, successfulTrips)}
                  isAnimationActive={false}
                >
                  <Tooltip content={<CustomTreemapTooltip />} />
                </Treemap>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      {waitingLongerThanTripCount > 0 && (
        <div className="stats-group">
          <h3 className="flex items-center gap-2">
            Waiting {'>'} Ride Duration <span className="inline-flex items-center justify-center rounded-full bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-100">{waitingLongerThanTripCount} Rides</span>
          </h3>
          <div className="flex flex-col items-center gap-4">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height={200}>
                <Treemap
                  data={[
                    { name: 'Waiting Time', size: totalWaitingTimeForLongerWaits },
                    { name: 'Riding Time', size: totalRidingTimeForLongerWaits },
                  ]}
                  dataKey="size"
                  stroke="#fff"
                  content={(props) => renderWaitingTreemapContent(props, waitingLongerThanTripCount)}
                  isAnimationActive={false}
                >
                  <Tooltip content={<CustomTreemapTooltip />} />
                </Treemap>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WaitingTimeCharts;