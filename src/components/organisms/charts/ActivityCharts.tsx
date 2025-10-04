import React from 'react';
import { ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis, CartesianGrid, ZAxis, ScatterChart, Scatter } from 'recharts';
import ContributionGraph, { DailyContribution } from '../ContributionGraph';
import { CSVRow } from '../../../services/csvParser';
import { TripStats } from '../../../hooks/useTripData';
import { DistanceUnit } from '../../../App';

interface ActivityChartsProps {
  data: TripStats;
  rows: CSVRow[];
  distanceUnit: DistanceUnit;
  activeCurrency: string | null;
}

const CustomScatterTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const { hour, count } = payload[0].payload;
    return (
      <div className="min-w-[150px] rounded-lg border bg-background/80 p-4 text-sm text-foreground shadow-lg backdrop-blur-sm border-border">
        <div className="mb-2 border-b border-border pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{`Hour: ${hour}:00 - ${hour}:59`}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="text-muted-foreground">Trips</div>
          <div className="font-medium text-right text-indigo-400">{count.toLocaleString()}</div>
        </div>
      </div>
    );
  }
  return null;
};

const ActivityCharts: React.FC<ActivityChartsProps> = ({
  data,
  rows,
  distanceUnit,
  activeCurrency,
}) => {
  const contributionData = React.useMemo(() => {
    if (!rows || rows.length === 0) return {};
    const dailyStats: { [key: string]: DailyContribution } = {};
    rows
      .filter(row => row.status?.toLowerCase() === 'completed')
      .forEach(row => {
        if (row.request_time) {
          const date = new Date(row.request_time);
          if (!isNaN(date.getTime())) {
            const dayStr = date.toISOString().split('T')[0];
            if (!dailyStats[dayStr]) {
              dailyStats[dayStr] = { count: 0, totalFare: {}, totalDistance: 0, totalWaitingTime: 0, totalRidingTime: 0 };
            }
            const stats = dailyStats[dayStr];
            stats.count++;

            const fare = parseFloat(row.fare_amount);
            const currency = row.fare_currency;
            if (currency && !isNaN(fare)) {
              stats.totalFare[currency] = (stats.totalFare[currency] || 0) + fare;
            }

            const distance = parseFloat(row.distance);
            if (!isNaN(distance)) {
              stats.totalDistance += distanceUnit === 'km' ? distance * 1.60934 : distance;
            }

            if (row.request_time && row.begin_trip_time) {
              const waitingTime = (new Date(row.begin_trip_time).getTime() - new Date(row.request_time).getTime()) / (1000 * 60);
              if (waitingTime > 0) stats.totalWaitingTime += waitingTime;
            }
            if (row.begin_trip_time && row.dropoff_time) {
              const ridingTime = (new Date(row.dropoff_time).getTime() - new Date(row.begin_trip_time).getTime()) / (1000 * 60);
              if (ridingTime > 0) stats.totalRidingTime += ridingTime;
            }
          }
        }
      });
    return dailyStats;
  }, [rows, distanceUnit]);

  const availableYears = React.useMemo(() => {
    const yearSet = new Set<number>();
    Object.keys(contributionData).forEach(dateStr => {
      yearSet.add(new Date(dateStr).getFullYear());
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [contributionData]);

  const tripsByHourData = React.useMemo(() => {
    const hourlyCounts: { [hour: number]: number } = {};
    for (let i = 0; i < 24; i++) {
      hourlyCounts[i] = 0;
    }

    rows
      .filter(row => row.status?.toLowerCase() === 'completed')
      .forEach(row => {
        if (row.request_time) {
          const date = new Date(row.request_time);
          if (!isNaN(date.getTime())) {
            hourlyCounts[date.getHours()]++;
          }
        }
      });

    return Object.entries(hourlyCounts).map(([hour, count]) => ({ hour: parseInt(hour), count }));
  }, [rows]);

  const [contributionView, setContributionView] = React.useState<'last-12-months' | number>('last-12-months');

  return (
    <div className="stats-group grid grid-cols-1 gap-8">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3>Trip Activity</h3>
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted p-1">
            <button
              onClick={() => setContributionView('last-12-months')}
              className={`flex-grow px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                contributionView === 'last-12-months' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              Last 12 Months
            </button>
            {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => setContributionView(year)}
                  className={`flex-grow px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    contributionView === year ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >{year}</button>
              ))}
          </div>
        </div>

        {Object.keys(contributionData).length > 0 ? (
          <div>
            <ContributionGraph data={contributionData} view={contributionView} />
          </div>
        ) : <p className="text-muted-foreground text-sm mt-2">No trip data with dates to display.</p>}
      </div>

      {tripsByHourData.length > 0 && (
        <div className="stats-group">
          <h3>Trips by Hour of Day</h3>
          <p className="hint -mt-2 mb-4">Shows your trip patterns throughout the day.</p>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}> 
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" dataKey="hour" name="Hour" unit=":00" domain={[0, 23]} tickCount={12} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis type="number" dataKey="count" name="Trips" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <ZAxis type="number" range={[60, 60]} />
              <Tooltip cursor={{ strokeDasharray: '3 3', fill: 'rgba(100, 116, 139, 0.1)' }} content={<CustomScatterTooltip />} />
              <Scatter name="Trips" data={tripsByHourData} fill="#818cf8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ActivityCharts;