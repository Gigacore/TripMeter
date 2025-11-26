import React from 'react';
import {
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
  CartesianGrid,
  ZAxis,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PolarRadiusAxis
} from 'recharts';
import { Moon, Sunrise, Sun, Sunset } from 'lucide-react';
import ContributionGraph, { DailyContribution } from '../ContributionGraph';
import RequestsMapModal from '../RequestsMapModal';

import { CSVRow } from '../../../services/csvParser';
import { TripStats } from '../../../hooks/useTripData';
import { formatCurrency } from '../../../utils/currency';
import { formatDuration } from '../../../utils/formatters';
import { DistanceUnit } from '../../../App';

interface ActivityChartsProps {
  data: TripStats;
  rows: CSVRow[];
  distanceUnit: DistanceUnit;
  activeCurrency: string | null;
}

// HACK: Using `any` to bypass a type issue with recharts TooltipProps.
const CustomScatterTooltip = (props: any) => {
  const { active, payload } = props;
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const { hour, count } = data;
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

// HACK: Using `any` to bypass a type issue with recharts TooltipProps.
const CustomRadarTooltip = (props: any) => {
  const { active, payload, activeCurrency, distanceUnit } = props;
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const { day, trips, cancellations, totalFare, totalDistance } = data;
    const value = trips ?? cancellations;
    const label = trips ? 'Trips' : 'Cancellations';

    return (
      <div className="min-w-[200px] rounded-lg border bg-background/80 p-4 text-sm text-foreground shadow-lg backdrop-blur-sm border-border">
        <div className="mb-2 border-b border-border pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{day}</p>
        </div>
        <div className="grid grid-cols-[1fr,auto] gap-x-4 gap-y-1.5">
          <div className="text-muted-foreground">{label}</div>
          <div className="font-medium text-right" style={{ color: payload[0].color }}>{value.toLocaleString()}</div>
          {trips > 0 && (
            <>
              {activeCurrency && totalFare > 0 && (
                <>
                  <div className="text-muted-foreground">Total Fare</div>
                  <div className="font-medium text-right">{formatCurrency(totalFare, activeCurrency)}</div>
                </>
              )}
              {totalDistance > 0 && (
                <>
                  <div className="text-muted-foreground">Total Distance</div>
                  <div className="font-medium text-right">{totalDistance.toFixed(2)} {distanceUnit}</div>
                </>
              )}
            </>
          )}
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

  const tripsByDayOfWeekData = React.useMemo(() => {
    const dayStats = Array(7).fill(0).map(() => ({
      trips: 0,
      totalFare: 0,
      totalDistance: 0,
    }));
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    rows
      .filter(row => row.status?.toLowerCase() === 'completed')
      .forEach(row => {
        if (row.request_time) {
          const date = new Date(row.request_time);
          if (!isNaN(date.getTime())) {
            const dayIndex = date.getDay();
            dayStats[dayIndex].trips++;

            if (row.fare_currency === activeCurrency && row.fare_amount) {
              const fare = parseFloat(row.fare_amount);
              if (!isNaN(fare)) {
                dayStats[dayIndex].totalFare += fare;
              }
            }

            if (row.distance) {
              const distance = parseFloat(row.distance);
              if (!isNaN(distance)) {
                const convertedDistance = distanceUnit === 'km' ? distance * 1.60934 : distance;
                dayStats[dayIndex].totalDistance += convertedDistance;
              }
            }
          }
        }
      });

    return days.map((day, index) => ({ day, ...dayStats[index] }));
  }, [rows, activeCurrency, distanceUnit]);

  const cancellationsByDayOfWeekData = React.useMemo(() => {
    const dayCounts: number[] = Array(7).fill(0); // 0: Sun, 1: Mon, ..., 6: Sat
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    rows
      .filter(row => row.status?.toLowerCase() === 'canceled' || row.status?.toLowerCase() === 'rider_canceled')
      .forEach(row => {
        if (row.request_time) {
          const date = new Date(row.request_time);
          if (!isNaN(date.getTime())) {
            dayCounts[date.getDay()]++;
          }
        }
      });

    return days.map((day, index) => ({ day, cancellations: dayCounts[index] }));
  }, [rows]);

  const hasCancellationsData = React.useMemo(() => cancellationsByDayOfWeekData.some(d => d.cancellations > 0), [cancellationsByDayOfWeekData]);

  const [contributionView, setContributionView] = React.useState<'last-12-months' | number>('last-12-months');

  const [mapModalState, setMapModalState] = React.useState<{
    isOpen: boolean;
    title: string;
    trips: CSVRow[];
  }>({
    isOpen: false,
    title: '',
    trips: [],
  });

  const handleDayClick = (dateStr: string) => {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString(undefined, { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });

    const tripsOnDay = rows.filter(row => {
      if (!row.request_time) return false;
      const rowDate = new Date(row.request_time);
      return !isNaN(rowDate.getTime()) && rowDate.toISOString().split('T')[0] === dateStr && row.status?.toLowerCase() === 'completed';
    });

    if (tripsOnDay.length > 0) {
      setMapModalState({
        isOpen: true,
        title: `Trips on ${formattedDate}`,
        trips: tripsOnDay,
      });
    }
  };

  const handleHourClick = (data: any) => {
    if (!data || typeof data.hour !== 'number') return;
    const hour = data.hour;

    const tripsInHour = rows.filter(row => {
      if (!row.request_time || row.status?.toLowerCase() !== 'completed') return false;
      const date = new Date(row.request_time);
      return !isNaN(date.getTime()) && date.getHours() === hour;
    });

    if (tripsInHour.length > 0) {
      setMapModalState({
        isOpen: true,
        title: `Trips at ${hour}:00 - ${hour}:59`,
        trips: tripsInHour,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 @container">
      <RequestsMapModal
        rows={mapModalState.trips}
        distanceUnit={distanceUnit}
        convertDistance={(d) => distanceUnit === 'km' ? d * 1.60934 : d}
        title={mapModalState.title}
        isOpen={mapModalState.isOpen}
        onOpenChange={(open) => setMapModalState(prev => ({ ...prev, isOpen: open }))}
      />

      <div className="stats-group">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold">Daily Activity</h3>
            <p className="text-xs sm:text-sm text-muted-foreground -mt-1">Shows your trip contributions over time.</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 rounded-lg bg-muted p-1 w-full sm:w-auto">
            <button
              onClick={() => setContributionView('last-12-months')}
              className={`flex-grow sm:flex-grow-0 px-2 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${contributionView === 'last-12-months' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
            >
              Last 12 Months
            </button>
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setContributionView(year)}
                className={`flex-grow sm:flex-grow-0 px-2 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${contributionView === year ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
              >{year}</button>
            ))}
          </div>
        </div>

        {Object.keys(contributionData).length > 0 ? (
          <div>
            <ContributionGraph
              data={contributionData}
              view={contributionView}
              onDayClick={handleDayClick}
            />
          </div>
        ) : <p className="text-muted-foreground text-sm mt-2">No trip data with dates to display.</p>}
      </div>



      {tripsByHourData.length > 0 && (
        <div className="stats-group">
          <h3 className="text-base sm:text-lg font-semibold">Trips by Hour of Day</h3>
          <p className="text-xs sm:text-sm text-muted-foreground -mt-2 mb-4">Shows your trip patterns throughout the day.</p>
          <div className="mobile-chart-height">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" dataKey="hour" name="Hour" unit=":00" domain={[0, 23]} tickCount={12} stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="number" dataKey="count" name="Trips" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <ZAxis type="number" range={[60, 60]} />
                <Tooltip cursor={{ strokeDasharray: '3 3', fill: 'rgba(100, 116, 139, 0.1)' }} content={<CustomScatterTooltip />} />
                <Scatter
                  name="Trips"
                  data={tripsByHourData}
                  fill="#818cf8"
                  onClick={handleHourClick}
                  cursor="pointer"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2 px-[30px]">
            <div className="flex flex-col items-center opacity-70">
              <Moon className="w-4 h-4" />
              <span>Night</span>
            </div>
            <div className="flex flex-col items-center opacity-70">
              <Sunrise className="w-4 h-4" />
              <span>Morning</span>
            </div>
            <div className="flex flex-col items-center opacity-70">
              <Sun className="w-4 h-4" />
              <span>Day</span>
            </div>
            <div className="flex flex-col items-center opacity-70">
              <Sunset className="w-4 h-4" />
              <span>Evening</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
        {tripsByDayOfWeekData.length > 0 && (
          <div className="stats-group">
            <h3 className="text-base sm:text-lg font-semibold">Completed Trips by Day</h3>
            <p className="text-xs sm:text-sm text-muted-foreground -mt-2 mb-4">Shows completed trips for each day of the week.</p>
            <div className="mobile-chart-height-lg">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={tripsByDayOfWeekData}>
                  <PolarGrid className="stroke-border" />
                  <PolarAngleAxis dataKey="day" stroke="#888" fontSize={12} tickLine={false} />
                  <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 5']} stroke="#888" fontSize={10} axisLine={false} tickLine={false} />
                  <Radar name="Trips" dataKey="trips" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                  <Tooltip cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '3 3' }} content={<CustomRadarTooltip activeCurrency={activeCurrency} distanceUnit={distanceUnit} />} />

                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {hasCancellationsData && (
          <div className="stats-group">
            <h3 className="text-base sm:text-lg font-semibold">Cancellations by Day</h3>
            <p className="text-xs sm:text-sm text-muted-foreground -mt-2 mb-4">Shows canceled trips for each day of the week.</p>
            <div className="mobile-chart-height-lg">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={cancellationsByDayOfWeekData}>
                  <PolarGrid className="stroke-border" />
                  <PolarAngleAxis dataKey="day" stroke="#888" fontSize={12} tickLine={false} />
                  <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 2']} stroke="#888" fontSize={10} axisLine={false} tickLine={false} />
                  <Radar name="Cancellations" dataKey="cancellations" stroke="#dc2626" fill="#dc2626" fillOpacity={0.6} />
                  <Tooltip cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '3 3' }} content={<CustomRadarTooltip activeCurrency={activeCurrency} distanceUnit={distanceUnit} />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCharts;
