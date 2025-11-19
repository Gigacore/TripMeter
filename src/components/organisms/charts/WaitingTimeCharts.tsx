import React from 'react';
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, TooltipProps, BarChart, Bar, LabelList, Legend } from 'recharts';
import { Map } from 'lucide-react';
import Stat from '../../atoms/Stat';
import { formatDuration, formatDurationWithSeconds } from '../../../utils/formatters';
import { CSVRow } from '../../../services/csvParser';
import { TripStats } from '../../../hooks/useTripData';
import RequestsMapModal from '../RequestsMapModal';
import { DistanceUnit } from '../../../App';

interface WaitingTimeChartsProps {
  data: TripStats;
  rows: CSVRow[];
  onFocusOnTrips: (tripRows: CSVRow[], title?: string) => void;
  onShowTripList: (type: string) => void;
  distanceUnit: DistanceUnit;
  convertDistance: (miles: number) => number;
}

const CustomDistributionTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="min-w-[200px] rounded-lg border bg-background/80 p-4 text-sm text-foreground shadow-lg backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <div className="mb-2 border-b border-slate-200 pb-2 dark:border-slate-700">
          <p className="recharts-tooltip-label font-bold text-base">{`Waiting Time: ${label}`}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="text-muted-foreground">Trips</div>
          <div className="font-medium text-right text-red-400">{payload[0].value?.toLocaleString()}</div>
        </div>
      </div>
    );
  }

  return null;
};

const CustomDayOfWeekTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="min-w-[200px] rounded-lg border bg-background/80 p-4 text-sm text-foreground shadow-lg backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <div className="mb-2 border-b border-slate-200 pb-2 dark:border-slate-700">
          <p className="recharts-tooltip-label font-bold text-base">{label}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="text-muted-foreground">Avg. Waiting Time</div>
          <div className="font-medium text-right text-red-400">
            {formatDurationWithSeconds(payload[0].value as number)}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, activeCurrency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="min-w-[200px] rounded-lg border bg-background/80 p-4 text-sm text-foreground shadow-lg backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <div className="mb-2 border-b border-slate-200 pb-2 dark:border-slate-700">
          <p className="recharts-tooltip-label font-bold text-base">{payload[0].name}</p>
        </div>
        <div className="text-muted-foreground">Duration</div>
        <div className="font-medium text-lg" style={{ color: payload[0].color }}>{formatDuration(payload[0].value as number, true)}</div>
      </div>
    );
  }
  return null;
};

const WaitingTimeCharts: React.FC<WaitingTimeChartsProps> = ({
  data,
  rows,
  onFocusOnTrips,
  onShowTripList,
  distanceUnit,
  convertDistance,
}) => {
  const {
    totalWaitingTime,
    avgWaitingTime,
    longestWaitingTime,
    longestWaitingTimeRow,
    shortestWaitingTime,
    shortestWaitingTimeRow,
    totalTripDuration,
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

  const waitingTimeByDayOfWeekData = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];

    const dayStats = Array(7).fill(0).map(() => ({
      totalWaitingTime: 0,
      tripCount: 0,
    }));
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    rows
      .filter(r => r.status?.toLowerCase() === 'completed' && r.request_time && r.begin_trip_time)
      .forEach(r => {
        const requestTime = new Date(r.request_time!);
        const beginTripTime = new Date(r.begin_trip_time!);
        if (!isNaN(requestTime.getTime()) && !isNaN(beginTripTime.getTime())) {
          const waitingTime = (beginTripTime.getTime() - requestTime.getTime()) / (1000 * 60); // in minutes
          if (waitingTime > 0) {
            const dayIndex = requestTime.getDay();
            dayStats[dayIndex].totalWaitingTime += waitingTime;
            dayStats[dayIndex].tripCount++;
          }
        }
      });

    return days.map((day, index) => ({
      day,
      avgWaitingTime: dayStats[index].tripCount > 0 ? dayStats[index].totalWaitingTime / dayStats[index].tripCount : 0,
    }));
  }, [rows]);

  const waitingVsRidingData = [
    { name: 'Riding Time', value: totalTripDuration, fill: '#34d399' },
    { name: 'Waiting Time', value: totalWaitingTime, fill: '#a78bfa' },
  ];

  return (
    <>
      <div className="stats-group">
        {waitingTimeDistributionData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={waitingTimeDistributionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomDistributionTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
              <Bar dataKey="count" fill="#ef4444" name="Number of Trips" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {waitingTimeByDayOfWeekData.length > 0 && (
        <div className="stats-group mt-6">
          <h3 className="text-lg font-semibold">Average Waiting Time by Day of Week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={waitingTimeByDayOfWeekData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} unit=" min" />
              <Tooltip content={<CustomDayOfWeekTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
              <Bar dataKey="avgWaitingTime" fill="#ef4444" name="Avg. Waiting Time" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {totalWaitingTime > 0 && totalTripDuration > 0 && (
        <div className="stats-group rounded-lg bg-muted/50 p-4">
          <h3 className="mb-2 text-foreground">Total Waiting vs. Riding Time</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">A comparison of total time spent waiting vs. total time spent riding across all trips.</p>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart
              layout="vertical"
              data={[{ name: 'Total', waiting: totalWaitingTime, riding: totalTripDuration }]}
              margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
              stackOffset="expand"
            >
              <XAxis type="number" hide domain={[0, 1]} />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
              <Legend iconSize={10} layout="horizontal" verticalAlign="top" align="center" payload={[{ value: 'Waiting Time', type: 'square', color: '#ef4444' }, { value: 'Riding Time', type: 'square', color: '#34d399' }] as any} />
              <Bar dataKey="waiting" stackId="a" fill="#ef4444" name="Waiting Time">
                <LabelList dataKey="waiting" position="center" formatter={(value: any) => formatDuration(value as number, true)} className="fill-white font-semibold" />
              </Bar>
              <Bar dataKey="riding" stackId="a" fill="#34d399" name="Riding Time">
                <LabelList dataKey="riding" position="center" formatter={(value: any) => formatDuration(value as number, true)} className="fill-white font-semibold" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {waitingLongerThanTripCount > 0 && (
        <div className="stats-group rounded-lg bg-muted/50 p-4 mt-4">
          <h4 className="flex items-center gap-2 text-card-foreground">
            Waited Longer Than Rode
            <span className="inline-flex items-center justify-center rounded-full bg-muted-foreground/20 px-2.5 py-1 text-xs font-medium text-foreground">{waitingLongerThanTripCount} Rides</span>
          </h4>
          <p className="text-xs text-muted-foreground mt-1 mb-3">For these trips, you spent more time waiting for your ride than riding in it.</p>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart
              layout="vertical"
              data={[{ name: 'Long Waits', waiting: totalWaitingTimeForLongerWaits, riding: totalRidingTimeForLongerWaits }]}
              margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
              stackOffset="expand"
            >
              <XAxis type="number" hide domain={[0, 1]} />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
              <Legend iconSize={10} layout="horizontal" verticalAlign="top" align="center" payload={[{ value: 'Waiting Time', type: 'square', color: '#ef4444' }, { value: 'Riding Time', type: 'square', color: '#34d399' }] as any} />
              <Bar dataKey="waiting" stackId="a" fill="#ef4444" name="Waiting Time">
                <LabelList dataKey="waiting" position="center" formatter={(value: any) => formatDuration(value as number, true)} className="fill-white font-semibold" />
              </Bar>
              <Bar dataKey="riding" stackId="a" fill="#34d399" name="Riding Time">
                <LabelList dataKey="riding" position="center" formatter={(value: any) => formatDuration(value as number, true)} className="fill-white font-semibold" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 w-full mt-4">
        <Stat label="Total Wait" value={formatDuration(totalWaitingTime, true)} onClick={() => onShowTripList('completed-map')} />
        <Stat label="Average Wait" value={formatDurationWithSeconds(avgWaitingTime)} onClick={() => onShowTripList('completed-map')} />

        {longestWaitingTimeRow ? (
          <RequestsMapModal
            rows={[longestWaitingTimeRow]}
            distanceUnit={distanceUnit}
            convertDistance={convertDistance}
          >
            <div className="cursor-pointer hover:bg-muted transition-colors duration-200 rounded-lg">
              <Stat
                label="Longest Wait"
                value={formatDurationWithSeconds(longestWaitingTime)}
                subValue={
                  <span className="flex items-center justify-center gap-1 text-blue-500 hover:underline">
                    <Map size={12} /> View on map
                  </span>
                }
              />
            </div>
          </RequestsMapModal>
        ) : (
          <Stat label="Longest Wait" value={formatDurationWithSeconds(longestWaitingTime)} />
        )}

        {shortestWaitingTimeRow ? (
          <RequestsMapModal
            rows={[shortestWaitingTimeRow]}
            distanceUnit={distanceUnit}
            convertDistance={convertDistance}
          >
            <div className="cursor-pointer hover:bg-muted transition-colors duration-200 rounded-lg">
              <Stat
                label="Shortest Wait"
                value={formatDurationWithSeconds(shortestWaitingTime)}
                subValue={
                  <span className="flex items-center justify-center gap-1 text-blue-500 hover:underline">
                    <Map size={12} /> View on map
                  </span>
                }
              />
            </div>
          </RequestsMapModal>
        ) : (
          <Stat label="Shortest Wait" value={formatDurationWithSeconds(shortestWaitingTime)} />
        )}
      </div>
    </>
  );
};

export default WaitingTimeCharts;