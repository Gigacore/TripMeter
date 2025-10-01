import React from 'react';
import { ResponsiveContainer, ScatterChart, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import Stat from '../../atoms/Stat';
import ContributionGraph from '../ContributionGraph';
import { CSVRow } from '../../../services/csvParser';
import { TripStats } from '../../../hooks/useTripData';

interface ActivityChartsProps {
  data: TripStats;
  rows: CSVRow[];
}

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
        <div className="contribution-graph-header">
          <h3>Trip Activity</h3>
          <select
            value={contributionView}
            onChange={(e) => setContributionView(e.target.value === 'last-12-months' ? 'last-12-months' : Number(e.target.value))}
          >
            <option value="last-12-months">Last 12 months</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        {Object.keys(contributionData).length > 0 ? (
          <div className="mt-4">
            <ContributionGraph data={contributionData} view={contributionView} />
          </div>
        ) : <p className="text-slate-500 text-sm mt-2">No trip data with dates to display.</p>}
      </div>

      <div className="stats-group">
        <h3>Streaks & Gaps</h3>
        <div className="stats-grid">
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
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="hour" name="Hour" unit=":00" domain={[0, 23]} tickCount={24} />
              <YAxis type="number" dataKey="count" name="Trips" />
              <ZAxis type="number" range={[100, 101]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value: number, name: string) => (name === 'Hour' ? `${value}:00 - ${value}:59` : value)}
              />
              <Scatter name="Trips" data={tripsByHourData} fill="#8884d8" />
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
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={successfulTripsByDayOfWeekData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="day" />
                    <PolarRadiusAxis angle={70} domain={[0, 'dataMax']} />
                    <Radar name="Completed Trips" dataKey="count" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
            {canceledTripsByDayOfWeekData.length > 0 && (
              <div>
                <h4 className="text-center text-slate-400 mb-2">Canceled Trips</h4>
                <ResponsiveContainer width="100%" height={500}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={canceledTripsByDayOfWeekData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="day" />
                    <PolarRadiusAxis angle={70} domain={[0, 'dataMax']} />
                    <Radar name="Canceled Trips" dataKey="count" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Tooltip />
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