import React from 'react';
import { ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis, CartesianGrid, ZAxis, ScatterChart, Scatter, Legend, Cell } from 'recharts';
import ContributionGraph from '../ContributionGraph';
import { formatCurrency } from '../../../utils/currency';
import { formatDuration } from '../../../utils/formatters';
import { CSVRow } from '../../../services/csvParser';
import { TripStats } from '../../../hooks/useTripData';
import { DistanceUnit } from '../../../App';
import { Flame, Pause, AlertTriangle } from 'lucide-react';

interface ActivityChartsProps {
  data: TripStats;
  rows: CSVRow[];
  distanceUnit: DistanceUnit;
  activeCurrency: string | null;
}

const CustomHeatmapTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const { day, hour, count } = payload[0].payload;
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="min-w-[150px] rounded-lg border border-slate-700 bg-slate-800/80 p-4 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <div className="mb-2 border-b border-slate-700 pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{`${dayNames[day]}, ${hour}:00 - ${hour}:59`}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="text-slate-400">Trips</div>
          <div className="font-medium text-right text-emerald-400">{count.toLocaleString()}</div>
        </div>
      </div>
    );
  }
  return null;
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

  const activityHeatmapData = React.useMemo(() => {
    const heatmapData: { day: number; hour: number; count: number }[] = [];
    const counts: number[][] = Array(7).fill(0).map(() => Array(24).fill(0));

    rows.forEach(row => {
      if (row.request_time) {
        const date = new Date(row.request_time);
        if (!isNaN(date.getTime())) {
          const day = date.getDay();
          const hour = date.getHours();
          counts[day][hour]++;
        }
      }
    });

    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmapData.push({ day, hour, count: counts[day][hour] });
      }
    }
    return heatmapData;
  }, [rows]);

  const maxCount = React.useMemo(() =>
    activityHeatmapData.reduce((max, item) => Math.max(max, item.count), 0),
  [activityHeatmapData]);

  const [contributionView, setContributionView] = React.useState<'last-12-months' | number>('last-12-months');

  return (
    <div className="stats-group grid grid-cols-1 gap-8">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
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
          <div>
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

      {activityHeatmapData.length > 0 && (
        <div>
          <h3 className="mb-2">Activity Heatmap</h3>
          <p className="hint -mt-2 mb-4">Shows your trip request patterns throughout the week.</p>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <AlertTriangle size={14} className="text-amber-500" />
            <span>This heatmap includes all trip requests, including cancellations.</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis
                type="number"
                dataKey="hour"
                name="Hour"
                domain={[0, 23]}
                tickFormatter={(h) => `${h}:00`}
                interval={2}
                stroke="#888"
                fontSize={11}
              />
              <YAxis type="number" dataKey="day" name="Day" domain={[-0.5, 6.5]} tickCount={7} tickFormatter={(d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]} stroke="#888" fontSize={11} />
              <ZAxis dataKey="count" range={[100, 1000]} domain={[0, maxCount]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomHeatmapTooltip />} />
              <Legend />
              <Scatter name="Trips" data={activityHeatmapData} shape="square">
                {activityHeatmapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.count > 0 ? `rgba(74, 222, 128, ${Math.max(0.1, entry.count / maxCount)})` : 'rgba(100, 116, 139, 0.1)'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ActivityCharts;