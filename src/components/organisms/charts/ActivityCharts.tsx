import React from 'react';
import { ResponsiveContainer, ScatterChart, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, TooltipProps } from 'recharts';
import ContributionGraph from '../ContributionGraph';
import { formatCurrency } from '../../../utils/currency';
import { formatDuration } from '../../../utils/formatters';
import { CSVRow } from '../../../services/csvParser';
import { TripStats } from '../../../hooks/useTripData';
import { DistanceUnit } from '../../../App';
import { Flame, Pause } from 'lucide-react';

interface ActivityChartsProps {
  data: TripStats;
  rows: CSVRow[];
  distanceUnit: DistanceUnit;
  activeCurrency: string | null;
}

const CustomScatterTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const { hour, count, totalDistance, totalRidingTime, totalWaitingTime, totalFare, distanceUnit } = payload[0].payload;
    return (
      <div className="min-w-[250px] rounded-lg border border-slate-700 bg-slate-800/80 p-4 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <div className="mb-2 border-b border-slate-700 pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{`Hour: ${hour}:00 - ${hour}:59`}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="text-slate-400">Trips</div><div className="font-medium text-right text-indigo-400">{count.toLocaleString()}</div>
          <div className="text-slate-400">Total Distance</div><div className="font-medium text-right">{totalDistance.toFixed(2)} {distanceUnit}</div>
          <div className="text-slate-400">Total Riding</div><div className="font-medium text-right">{formatDuration(totalRidingTime, true)}</div>
          <div className="text-slate-400">Total Waiting</div><div className="font-medium text-right">{formatDuration(totalWaitingTime, true)}</div>
          {Object.entries(totalFare).map(([currency, amount]) => (
            <React.Fragment key={currency}>
              <div className="text-slate-400">Total Fare ({currency})</div><div className="font-medium text-right">{formatCurrency(amount as number, currency)}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const CustomRadarTooltip = ({ active, payload, label, colorClass, seriesName, distanceUnit }: TooltipProps<number, string> & { colorClass: string, seriesName: string, distanceUnit: DistanceUnit }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="min-w-[250px] rounded-lg border border-slate-700 bg-slate-800/80 p-4 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <div className="mb-2 border-b border-slate-700 pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{`Day: ${label}`}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className={`text-slate-400 ${colorClass}`}>{seriesName}</div><div className={`font-medium text-right ${colorClass}`}>{`${payload[0].value?.toLocaleString()}${seriesName === 'Avg. Speed' ? ` ${distanceUnit === 'miles' ? 'mph' : 'km/h'}` : ''}`}</div>
          {seriesName === 'Completed' && (
            <>
              <div className="text-slate-400">Total Distance</div><div className="font-medium text-right">{data.totalDistance.toFixed(2)} {distanceUnit}</div>
              <div className="text-slate-400">Total Riding</div><div className="font-medium text-right">{formatDuration(data.totalRidingTime, true)}</div>
              <div className="text-slate-400">Total Waiting</div><div className="font-medium text-right">{formatDuration(data.totalWaitingTime, true)}</div>
              {Object.entries(data.totalFare).map(([currency, amount]) => (
                <React.Fragment key={currency}>
                  <div className="text-slate-400">Total Fare ({currency})</div><div className="font-medium text-right">{formatCurrency(amount as number, currency)}</div>
                </React.Fragment>
              ))}
            </>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const renderPolarAngleAxis = ({ payload, x, y, cx, cy, ...rest }: any) => {
  return (
    <text
      {...rest}
      y={y + (y - cy) / 10}
      x={x + (x - cx) / 20}
      className="fill-slate-400 text-xs"
    >{payload.value}</text>
  );
};

const formatDateRange = (start: number | null, end: number | null): string | null => {
  if (!start || !end) return null;
  const startDate = new Date(start).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  const endDate = new Date(end).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  if (startDate === endDate) return startDate;
  return `${startDate} - ${endDate}`;
};

const ActivityCharts: React.FC<ActivityChartsProps> = ({
  data,
  rows,
  distanceUnit,
  activeCurrency,
}) => {
  const {
    longestStreak,
    longestGap,
  } = data;

  const contributionData = React.useMemo(() => {
    if (!rows || rows.length === 0) return {};
    const dailyCounts: { [key: string]: number } = {};
    rows
      .filter(row => row.status?.toLowerCase() === 'completed')
      .forEach(row => {
        if (row.request_time) {
          const date = new Date(row.request_time);
          if (!isNaN(date.getTime())) {
            const day = date.toISOString().split('T')[0];
            dailyCounts[day] = (dailyCounts[day] || 0) + 1;
          }
        }
      });
    return dailyCounts;
  }, [rows]);

  const availableYears = React.useMemo(() => {
    const yearSet = new Set<number>();
    Object.keys(contributionData).forEach(dateStr => {
      yearSet.add(new Date(dateStr).getFullYear());
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [contributionData]);

  const tripsByHourData = React.useMemo(() => {
    if (!rows || rows.length === 0) {
      return [];
    }
    const countsByHour: { [hour: number]: number } = Array.from({ length: 24 }, () => 0).reduce((acc, _, i) => {
        acc[i] = 0;
        return acc;
      }, {} as { [hour: number]: number });

    type HourlyStats = {
      count: number;
      totalFare: { [key: string]: number };
      totalDistance: number;
      totalRidingTime: number;
      totalWaitingTime: number;
    };

    const statsByHour: { [hour: number]: HourlyStats } = Array.from({ length: 24 }, (_, i) => i).reduce((acc, hour) => {
      acc[hour] = {
        count: 0,
        totalFare: {},
        totalDistance: 0,
        totalRidingTime: 0,
        totalWaitingTime: 0,
      };
      return acc;
    }, {} as { [hour: number]: HourlyStats });

    rows.forEach(row => {
      if (row.status?.toLowerCase() === 'completed' && row.request_time) {
        const date = new Date(row.request_time);
        if (!isNaN(date.getTime())) {
          const hour = date.getHours();
          statsByHour[hour].count++;

          const fare = parseFloat(row.fare_amount);
          const currency = row.fare_currency;
          if (currency && !isNaN(fare)) {
            statsByHour[hour].totalFare[currency] = (statsByHour[hour].totalFare[currency] || 0) + fare;
          }

          const distance = parseFloat(row.distance);
          if (!isNaN(distance)) {
            statsByHour[hour].totalDistance += distanceUnit === 'km' ? distance * 1.60934 : distance;
          }

          if (row.request_time && row.begin_trip_time) {
            const waitingTime = (new Date(row.begin_trip_time).getTime() - new Date(row.request_time).getTime()) / (1000 * 60);
            if (waitingTime > 0) statsByHour[hour].totalWaitingTime += waitingTime;
          }
          if (row.begin_trip_time && row.dropoff_time) {
            const ridingTime = (new Date(row.dropoff_time).getTime() - new Date(row.begin_trip_time).getTime()) / (1000 * 60);
            if (ridingTime > 0) statsByHour[hour].totalRidingTime += ridingTime;
          }
        }
      }
    });

    return Object.entries(statsByHour).map(([hour, stats]) => ({ hour: parseInt(hour, 10), ...stats, distanceUnit }));
  }, [rows, distanceUnit]);

  const successfulTripsByDayOfWeekData = React.useMemo(() => {
    if (!rows || rows.length === 0) {
      return [];
    }

    type DailyStats = {
      count: number;
      totalFare: { [key: string]: number };
      totalDistance: number;
      totalRidingTime: number;
      totalWaitingTime: number;
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const statsByDay: DailyStats[] = Array(7).fill(0).map(() => ({
      count: 0,
      totalFare: {},
      totalDistance: 0,
      totalRidingTime: 0,
      totalWaitingTime: 0,
    }));

    rows
      .filter(row => row.status?.toLowerCase() === 'completed' && row.request_time)
      .forEach(row => {
        const date = new Date(row.request_time);
        if (!isNaN(date.getTime())) {
          const dayIndex = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
          statsByDay[dayIndex].count++;

          const fare = parseFloat(row.fare_amount);
          const currency = row.fare_currency;
          if (currency && !isNaN(fare)) {
            statsByDay[dayIndex].totalFare[currency] = (statsByDay[dayIndex].totalFare[currency] || 0) + fare;
          }

          const distance = parseFloat(row.distance);
          if (!isNaN(distance)) {
            statsByDay[dayIndex].totalDistance += distanceUnit === 'km' ? distance * 1.60934 : distance;
          }

          if (row.request_time && row.begin_trip_time) {
            const waitingTime = (new Date(row.begin_trip_time).getTime() - new Date(row.request_time).getTime()) / (1000 * 60);
            if (waitingTime > 0) statsByDay[dayIndex].totalWaitingTime += waitingTime;
          }
          if (row.begin_trip_time && row.dropoff_time) {
            const ridingTime = (new Date(row.dropoff_time).getTime() - new Date(row.begin_trip_time).getTime()) / (1000 * 60);
            if (ridingTime > 0) statsByDay[dayIndex].totalRidingTime += ridingTime;
          }
        }
      });

    return statsByDay.map((stats, index) => ({ day: dayNames[index], ...stats }));
  }, [rows, distanceUnit]);

  const canceledTripsByDayOfWeekData = React.useMemo(() => {
    if (!rows || rows.length === 0) {
      return [];
    }
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const countsByDay: number[] = Array(7).fill(0);

    rows
      .filter(row => {
        const status = row.status?.toLowerCase();
        return (status === 'rider_canceled' || status === 'driver_canceled') && row.request_time;
      })
      .forEach(row => {
        const date = new Date(row.request_time);
        if (!isNaN(date.getTime())) {
          const day = date.getDay();
          countsByDay[day]++;
        }
      });

    return countsByDay.map((count, index) => ({
      day: dayNames[index],
      count,
    }));
  }, [rows]);

  const [contributionView, setContributionView] = React.useState<'last-12-months' | number>('last-12-months');

  return (
    <div className="stats-group grid grid-cols-1 gap-8">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3>Trip Activity</h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <button onClick={() => setContributionView('last-12-months')} className={`px-3 py-1.5 text-xs font-medium transition-colors rounded-md ${contributionView === 'last-12-months' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
              Last 12 months
            </button>
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => setContributionView(year)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors rounded-md ${contributionView === year ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {Object.keys(contributionData).length > 0 ? (
          <div className="mt-4">
            <ContributionGraph data={contributionData} view={contributionView} />
          </div>
        ) : <p className="text-slate-500 text-sm mt-2">No trip data with dates to display.</p>}
      </div>

      <div>
        <h3 className="mb-4">Streaks & Gaps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="flex items-start gap-4 rounded-lg bg-slate-800/50 p-4">
            <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400">
              <Flame size={24} />
            </div>
            <div>
              <div className="text-slate-400">Longest Streak</div>
              <div className="text-2xl font-bold text-slate-50">{longestStreak.days} {longestStreak.days === 1 ? 'day' : 'days'}</div>
              <div className="text-xs text-slate-500">{formatDateRange(longestStreak.startDate, longestStreak.endDate)}</div>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-lg bg-slate-800/50 p-4">
            <div className="rounded-full bg-red-500/20 p-2 text-red-400">
              <Pause size={24} />
            </div>
            <div>
              <div className="text-slate-400">Longest Gap</div>
              <div className="text-2xl font-bold text-slate-50">{longestGap.days} {longestGap.days === 1 ? 'day' : 'days'}</div>
              <div className="text-xs text-slate-500">{formatDateRange(longestGap.startDate, longestGap.endDate)}</div>
            </div>
          </div>
        </div>
        <p className="hint mt-2">Consecutive days with trips (streak) versus consecutive days without (gap).</p>
      </div>

      {tripsByHourData.length > 0 && (
        <div>
          <h3 className="mb-2">Trips by Hour of Day</h3>
          <p className="hint -mt-2 mb-4">Shows your trip patterns throughout the day.</p>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis type="number" dataKey="hour" name="Hour" unit=":00" domain={[0, 23]} tickCount={12} stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis type="number" dataKey="count" name="Trips" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <ZAxis type="number" range={[60, 60]} />
              <Tooltip cursor={{ strokeDasharray: '3 3', fill: 'rgba(100, 116, 139, 0.1)' }} content={<CustomScatterTooltip />} />
              <Scatter name="Trips" data={tripsByHourData} fill="#818cf8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {(successfulTripsByDayOfWeekData.length > 0 || canceledTripsByDayOfWeekData.length > 0) && (
        <div>
          <h3 className="mb-2">Trips by Day of Week</h3>
          <p className="hint -mt-2 mb-4">See which days of the week you are most active.</p>
          <div className="grid md:grid-cols-2 gap-8">
            {successfulTripsByDayOfWeekData.length > 0 && (
              <div>
                <h4 className="text-center text-slate-400 mb-2">Completed Trips</h4>
                <ResponsiveContainer width="100%" height={500}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={successfulTripsByDayOfWeekData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <PolarGrid strokeOpacity={0.3} />
                    <PolarAngleAxis dataKey="day" tick={renderPolarAngleAxis} />
                    <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                    <Radar name="Completed Trips" dataKey="count" stroke="#34d399" fill="#34d399" fillOpacity={0.6} />
                    <Tooltip content={<CustomRadarTooltip colorClass="text-emerald-400" seriesName="Completed" distanceUnit={distanceUnit} />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
            {canceledTripsByDayOfWeekData.length > 0 && (
              <div>
                <h4 className="text-center text-slate-400 mb-2">Canceled Trips</h4>
                <ResponsiveContainer width="100%" height={500}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={canceledTripsByDayOfWeekData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <PolarGrid strokeOpacity={0.3} />
                    <PolarAngleAxis dataKey="day" tick={renderPolarAngleAxis} />
                    <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                    <Radar name="Canceled Trips" dataKey="count" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Tooltip content={<CustomRadarTooltip colorClass="text-red-500" seriesName="Canceled" distanceUnit={distanceUnit} />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityCharts;