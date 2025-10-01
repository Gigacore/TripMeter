import React from 'react';
import { ResponsiveContainer, ScatterChart, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, TooltipProps } from 'recharts';
import Stat from '../../atoms/Stat';
import ContributionGraph from '../ContributionGraph';
import { CSVRow } from '../../../services/csvParser';
import { TripStats } from '../../../hooks/useTripData';

interface ActivityChartsProps {
  data: TripStats;
  rows: CSVRow[];
}

const CustomScatterTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const { hour, count } = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <p className="recharts-tooltip-label font-bold">{`Hour: ${hour}:00 - ${hour}:59`}</p>
        <p className="recharts-tooltip-item text-indigo-400">{`Trips: ${count.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const CustomRadarTooltip = ({ active, payload, label, colorClass, seriesName }: TooltipProps<number, string> & { colorClass: string, seriesName: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <p className="recharts-tooltip-label font-bold">{`Day: ${label}`}</p>
        <p className={`recharts-tooltip-item ${colorClass}`}>{`${seriesName}: ${payload[0].value?.toLocaleString()}`}</p>
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

    rows.forEach(row => {
      if (row.status?.toLowerCase() === 'completed' && row.request_time) {
        const date = new Date(row.request_time);
        if (!isNaN(date.getTime())) {
          const hour = date.getHours();
          countsByHour[hour]++;
        }
      }
    });

    return Object.entries(countsByHour).map(([hour, count]) => ({ hour: parseInt(hour, 10), count }));
  }, [rows]);

  const successfulTripsByDayOfWeekData = React.useMemo(() => {
    if (!rows || rows.length === 0) {
      return [];
    }
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const countsByDay: number[] = Array(7).fill(0);

    rows
      .filter(row => row.status?.toLowerCase() === 'completed' && row.request_time)
      .forEach(row => {
        const date = new Date(row.request_time);
        if (!isNaN(date.getTime())) {
          const day = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
          countsByDay[day]++;
        }
      });

    return countsByDay.map((count, index) => ({
      day: dayNames[index],
      count,
    }));
  }, [rows]);

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
    <>
      <div className="stats-group">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3>Trip Activity</h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <button onClick={() => setContributionView('last-12-months')} className={`px-3 py-1.5 text-xs font-medium transition-colors rounded-md ${contributionView === 'last-12-months' ? 'bg-emerald-500 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}>
              Last 12 months
            </button>
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => setContributionView(year)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors rounded-md ${contributionView === year ? 'bg-emerald-500 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
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

      <div className="stats-group">
        <h3>Streaks & Gaps</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 w-full mt-4">
          <Stat
            label="Longest Streak"
            value={`${longestStreak.days} ${longestStreak.days === 1 ? 'day' : 'days'}`}
            subValue={formatDateRange(longestStreak.startDate, longestStreak.endDate)} />
          <Stat
            label="Longest Gap"
            value={`${longestGap.days} ${longestGap.days === 1 ? 'day' : 'days'}`}
            subValue={formatDateRange(longestGap.startDate, longestGap.endDate)} />
        </div>
        <p className="hint mt-2">Based on days with at least one completed trip.</p>
      </div>

      {tripsByHourData.length > 0 && (
        <div className="stats-group">
          <h3>Trips by Hour of Day</h3>
          <p className="hint -mt-2 mb-4">Number of completed trips for each hour of the day.</p>
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
        <div className="stats-group">
          <h3>Trips by Day of Week</h3>
          <p className="hint -mt-2 mb-4">Trip distribution across the week.</p>
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
                    <Tooltip content={<CustomRadarTooltip colorClass="text-emerald-400" seriesName="Completed" />} />
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
                    <Tooltip content={<CustomRadarTooltip colorClass="text-red-500" seriesName="Canceled" />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ActivityCharts;