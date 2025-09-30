import React, { ChangeEvent } from 'react';
import { Sankey, Tooltip, ResponsiveContainer, Layer, Rectangle, Treemap, BarChart, Bar, XAxis, YAxis, CartesianGrid, ScatterChart, Scatter, ZAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, Legend, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import Stat from '../atoms/Stat';
import { formatDuration, formatDurationWithSeconds } from '../../utils/formatters';
import { downloadKML } from '../../services/kmlService';
import { CSVRow } from '../../services/csvParser';
import { TripStats } from '../../hooks/useTripData';
import ContributionGraph from '../../ContributionGraph';
import { DistanceUnit } from '../../App';

interface SankeyNodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: { name: string; value: number };
  onShowTripList: (type: string) => void;
}

const SankeyNode: React.FC<SankeyNodeProps> = ({ x, y, width, height, index, payload, onShowTripList }) => {
  const isClickable = payload.name !== 'Total Requests';
  const handleClick = () => {
    if (!isClickable) return;
    const typeMap: { [key: string]: string } = {
      'Successful': 'successful',
      'Rider Canceled': 'rider_canceled',
      'Driver Canceled': 'driver_canceled',
      'Unfulfilled': 'unfulfilled',
    };
    onShowTripList(typeMap[payload.name]);
  };

  return (
    <Layer key={`CustomNode${index}`}>
      <Rectangle x={x} y={y} width={width} height={height} fill="#666" fillOpacity="1" onClick={handleClick} cursor={isClickable ? 'pointer' : 'default'} />
      <text textAnchor="middle" x={x + width / 2} y={y + height / 2} fontSize="14" fill="#fff" strokeWidth="0">
        {payload.name} ({payload.value})
      </text>
    </Layer>
  );
};

interface StatsProps {
  data: TripStats;
  onFocusOnTrip: (tripRow: CSVRow) => void;
  onShowTripList: (type: string) => void;
  distanceUnit: DistanceUnit;
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  isProcessing: boolean;
  rows: CSVRow[];
}

const formatDateRange = (start: number | null, end: number | null): string | null => {
  if (!start || !end) return null;
  const startDate = new Date(start).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  const endDate = new Date(end).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  if (startDate === endDate) return startDate;
  return `${startDate} - ${endDate}`;
};

const Stats: React.FC<StatsProps> = ({
  data,
  onFocusOnTrip,
  onShowTripList,
  distanceUnit,
  onFileSelect,
  isProcessing,
  rows,
}) => {
  const {
    totalTrips,
    successfulTrips,
    riderCanceledTrips,
    driverCanceledTrips,
    totalFareByCurrency,
    avgFareByCurrency,
    lowestFareByCurrency,
    highestFareByCurrency,
    totalTripDuration,
    avgTripDuration,
    longestTrip,
    longestTripRow,
    shortestTrip,
    shortestTripRow,
    totalWaitingTime,
    avgWaitingTime,
    longestWaitingTime,
    longestWaitingTimeRow,
    shortestWaitingTime,
    shortestWaitingTimeRow,
    waitingLongerThanTripCount,
    totalWaitingTimeForLongerWaits,
    totalRidingTimeForLongerWaits,
    totalCompletedDistance,
    longestTripByDist,
    longestTripByDistRow,
    shortestTripByDist,
    shortestTripByDistRow,
    costPerDistanceByCurrency,
    avgSpeed,
    fastestTripBySpeed,
    fastestTripBySpeedRow,
    slowestTripBySpeed,
    slowestTripBySpeedRow,
    costPerDurationByCurrency,
    longestStreak,
    avgCostPerDistanceByYear,
    longestGap,
    totalFareByYear,
    tripsByYear,
  } = data;

  const currencies = Object.keys(totalFareByCurrency);
  const [activeCurrency, setActiveCurrency] = React.useState<string | null>(currencies.length > 0 ? currencies[0] : null);

  React.useEffect(() => {
    if (currencies.length > 0 && (!activeCurrency || !currencies.includes(activeCurrency))) {
      setActiveCurrency(currencies[0]);
    }
  }, [currencies, activeCurrency]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const actionsEnabled = rows.length > 0 && !isProcessing;

  const handleDownloadKML = (which: 'both' | 'begin' | 'drop') => {
    downloadKML(rows, which);
  };

  const unfulfilledTrips = totalTrips - successfulTrips - riderCanceledTrips - driverCanceledTrips;

  const sankeyData = {
    nodes: [
      { name: 'Total Requests' },
      { name: 'Successful' },
      { name: 'Rider Canceled' },
      { name: 'Driver Canceled' },
      { name: 'Unfulfilled' },
    ],
    links: [
      { source: 0, target: 1, value: successfulTrips },
      { source: 0, target: 2, value: riderCanceledTrips },
      { source: 0, target: 3, value: driverCanceledTrips },
      { source: 0, target: 4, value: unfulfilledTrips },
    ].filter(link => link.value > 0),
  };

  const productTypeData = React.useMemo(() => {
    if (!rows || rows.length === 0) {
      return [];
    }
    const counts = rows.reduce((acc: { [key: string]: number }, trip) => {
      const product = trip.product_type || 'N/A';
      acc[product] = (acc[product] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, size]) => ({ name: `${name} (${size})`, size }));
  }, [rows]);

  const renderSankeyNode = React.useCallback(
    (props: any) => <SankeyNode {...props} onShowTripList={onShowTripList} />,
    [onShowTripList]
  );

  const fareDistributionData = React.useMemo(() => {
    if (!rows || rows.length === 0 || !activeCurrency) return [];
    const fares = rows
      .filter(r => r.fare_currency === activeCurrency && r.fare_amount && parseFloat(r.fare_amount) > 0)
      .map(r => parseFloat(r.fare_amount));
    if (fares.length === 0) return [];

    const maxFare = Math.max(...fares);
    const bucketCount = 10;
    const bucketSize = Math.ceil(maxFare / bucketCount);
    if (bucketSize === 0) return [];

    const buckets = Array.from({ length: bucketCount }, () => 0);
    fares.forEach(fare => {
      const bucketIndex = Math.min(Math.floor(fare / bucketSize), bucketCount - 1);
      buckets[bucketIndex]++;
    });

    return buckets.map((count, i) => ({
      name: `${i * bucketSize}-${(i + 1) * bucketSize}`,
      count,
    }));
  }, [rows, activeCurrency]);

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
      name: `${i * bucketSize}-${(i + 1) * bucketSize} min`,
      count,
    }));
  }, [rows]);

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

  const distanceDistributionData = React.useMemo(() => {
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

  const speedDistributionData = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const speeds = rows
      .filter(r => r.status?.toLowerCase() === 'completed' && r.distance && parseFloat(r.distance) > 0 && r.begin_trip_time && r.dropoff_time)
      .map(r => {
        const durationHours = (new Date(r.dropoff_time).getTime() - new Date(r.begin_trip_time).getTime()) / (1000 * 60 * 60);
        if (durationHours <= 0) return null;
        return parseFloat(r.distance) / durationHours;
      })
      .filter((speed): speed is number => speed !== null && speed > 0);
    if (speeds.length === 0) return [];

    const maxSpeed = Math.max(...speeds);
    const bucketCount = 10;
    const bucketSize = Math.ceil(maxSpeed / bucketCount) || 1;

    const buckets = Array.from({ length: bucketCount }, () => 0);
    speeds.forEach(speed => {
      const bucketIndex = Math.min(Math.floor(speed / bucketSize), bucketCount - 1);
      buckets[bucketIndex]++;
    });

    return buckets.map((count, i) => ({
      name: `${i * bucketSize}-${(i + 1) * bucketSize}`,
      count,
    }));
  }, [rows]);

  const treemapColors = React.useMemo(() => ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'], []);
  const renderTreemapContent = React.useCallback((props: any) => <CustomizedContent {...props} colors={treemapColors} />, [treemapColors]);

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
      {currencies.length > 1 && (
        <div className="stats-group mb-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {currencies.map(currency => (
              <button
                key={currency}
                onClick={() => setActiveCurrency(currency)}
                className={`px-4 py-3 text-sm font-semibold transition-colors text-left border-b-2 ${
                  activeCurrency === currency
                    ? 'border-emerald-400 text-slate-100'
                    : 'border-transparent text-slate-400 hover:text-slate-200 active:bg-slate-800'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-normal">{currency}</span>
                  <span className="font-bold text-base">
                    {(totalFareByCurrency[currency] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="section">
        {currencies.length > 0 && activeCurrency &&(
          <div className="stats-group">
            <h3>Fare Distribution</h3>
              <div className="flex gap-4">
                {/* Redesigned vertical tab UI for Fare section */}
                <div className="flex w-full min-h-[220px]">
                  <div className="flex-1 p-8 flex flex-col items-start gap-6">
                    <div className="w-full">
                    {fareDistributionData.length > 0 && (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={fareDistributionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8884d8" name="Number of Trips" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 w-full">
                      <Stat
                        label="Avg. Fare"
                        unit={activeCurrency}
                        value={(avgFareByCurrency[activeCurrency] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      />
                      {lowestFareByCurrency[activeCurrency] && (
                        <Stat
                          label="Lowest Fare"
                          unit={activeCurrency}
                          value={lowestFareByCurrency[activeCurrency]!.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          onClick={() => lowestFareByCurrency[activeCurrency] && onFocusOnTrip(lowestFareByCurrency[activeCurrency]!.row)}
                        />
                      )}
                      {highestFareByCurrency[activeCurrency] && (
                        <Stat
                          label="Highest Fare"
                          unit={activeCurrency}
                          value={highestFareByCurrency[activeCurrency]!.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          onClick={() => highestFareByCurrency[activeCurrency] && onFocusOnTrip(highestFareByCurrency[activeCurrency]!.row)}
                        />
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {activeCurrency && totalFareByYear[activeCurrency] && totalFareByYear[activeCurrency]!.length > 0 && (
        <div className="stats-group">
          <h3>Total Fare by Year</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={totalFareByYear[activeCurrency]}
              margin={{
                top: 5,
                right: 20,
                left: 10,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorTotalFare" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value: number) => [value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), `Total Fare (${activeCurrency})`]} />
              <Legend />
              <Area type="monotone" dataKey="total" stroke="#10b981" fillOpacity={1} fill="url(#colorTotalFare)" name={`Total Fare (${activeCurrency})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {/* {activeCurrency && avgCostPerDistanceByYear[activeCurrency] && avgCostPerDistanceByYear[activeCurrency]!.length > 0 && (
        <div className="stats-group">
          <h3>Average Cost per {distanceUnit} by Year</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={avgCostPerDistanceByYear[activeCurrency]}
              margin={{
                top: 5,
                right: 20,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [value.toFixed(2), `Avg. Cost / ${distanceUnit}`]}
              />
              <Legend />
              <Line type="monotone" dataKey="cost" stroke="#8884d8" name={`Avg. Cost / ${distanceUnit} (${activeCurrency})`} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )} */}
      <div className="section">
        {sankeyData.links.length > 0 && (
          <div className="stats-group mb-6">
            <h3>Trip Summary</h3>
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={500}>
                <Sankey
                  data={sankeyData}
                  node={renderSankeyNode}
                  nodePadding={50}
                  margin={{ left: 100, right: 100, top: 5, bottom: 5 }}
                  link={{ stroke: '#77c878' }}
                >
                  <Tooltip />
                </Sankey>
              </ResponsiveContainer>
            </div>
            <div className="stats-grid five-col mt-4">
            <Stat label="Total Requests" value={totalTrips} onClick={() => onShowTripList('all')} />
            <Stat label="Successful" value={successfulTrips} onClick={() => onShowTripList('successful')} />
            <Stat label="Rider Canceled" value={riderCanceledTrips} onClick={() => onShowTripList('rider_canceled')} />
            <Stat label="Driver Canceled" value={driverCanceledTrips} onClick={() => onShowTripList('driver_canceled')} />
            {unfulfilledTrips > 0 && <Stat label="Unfulfilled" value={unfulfilledTrips} onClick={() => onShowTripList('unfulfilled')} />}
          </div>
        </div>
        )}

        {tripsByYear.length > 0 && (
          <div className="stats-group">
            <h3>Trips by Year</h3>
            <p className="hint -mt-2 mb-4">Total completed trips each year.</p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={tripsByYear}
                margin={{
                  top: 5,
                  right: 20,
                  left: 10,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#8884d8" fillOpacity={1} fill="url(#colorTrips)" name="Trips" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="stats-group">
          <h3>Ride Duration</h3>
          {durationDistributionData.length > 0 && (
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={durationDistributionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" name="Number of Trips" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="stats-grid four-col mt-4">
            <Stat label="Total" value={formatDuration(totalTripDuration, true)} />
            <Stat label="Average" value={formatDurationWithSeconds(avgTripDuration)} />
            <Stat label="Longest" value={formatDurationWithSeconds(longestTrip)} onClick={() => longestTripRow && onFocusOnTrip(longestTripRow)} />
            <Stat label="Shortest" value={formatDurationWithSeconds(shortestTrip)} onClick={() => shortestTripRow && onFocusOnTrip(shortestTripRow)} />
          </div>
          <h3 className="mt-4">Distance</h3>
          {distanceDistributionData.length > 0 && (
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distanceDistributionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ff8042" name="Number of Trips" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="stats-grid four-col mt-4">
            <Stat label="Total" value={totalCompletedDistance.toFixed(2)} unit={distanceUnit} />
            <Stat label="Longest" value={longestTripByDist.toFixed(2)} unit={distanceUnit} onClick={() => longestTripByDistRow && onFocusOnTrip(longestTripByDistRow)} />
            <Stat label="Shortest" value={shortestTripByDist.toFixed(2)} unit={distanceUnit} onClick={() => shortestTripByDistRow && onFocusOnTrip(shortestTripByDistRow)} />
            {activeCurrency && costPerDistanceByCurrency[activeCurrency] !== undefined && (
              <Stat
                label={`Cost per ${distanceUnit}`}
                unit={`${activeCurrency}/${distanceUnit}`}
                value={costPerDistanceByCurrency[activeCurrency]!.toFixed(2)}
              />
            )}
          </div>
          <h3 className="mt-4">Waiting Time</h3>
          {waitingTimeDistributionData.length > 0 && (
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={waitingTimeDistributionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ffc658" name="Number of Trips" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="stats-grid four-col mt-4">
            <Stat label="Total" value={formatDuration(totalWaitingTime, true)} />
            <Stat label="Average" value={formatDurationWithSeconds(avgWaitingTime)} />
            <Stat label="Longest" value={formatDurationWithSeconds(longestWaitingTime)} onClick={() => longestWaitingTimeRow && onFocusOnTrip(longestWaitingTimeRow)} />
            <Stat label="Shortest" value={formatDurationWithSeconds(shortestWaitingTime)} onClick={() => shortestWaitingTimeRow && onFocusOnTrip(shortestWaitingTimeRow)} />
          </div>
        </div>
        {totalWaitingTime > 0 && totalTripDuration > 0 && (
          <div className="stats-group">
            <h3>Waiting vs. Riding</h3>
            <div className="flex flex-col gap-4 items-center">
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
                    <Tooltip formatter={(value: number) => [formatDuration(value, true), 'Duration']} />
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
            <div className="flex flex-col gap-4 items-center">
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
                    <Tooltip
                      formatter={(value: number) => [formatDuration(value, true), 'Duration']}
                    />
                  </Treemap>
                </ResponsiveContainer>
              </div>
              {/* <div className="w-full">
                <div className="stats-grid grid-cols-3">
                  <Stat label="Count" value={waitingLongerThanTripCount} subValue="Trips where waiting time exceeded ride duration" />
                  <Stat label="Total Waiting" value={formatDuration(totalWaitingTimeForLongerWaits, true)} />
                  <Stat label="Total Riding" value={formatDuration(totalRidingTimeForLongerWaits, true)} />
                </div>
              </div> */}
            </div>
          </div>
        )}

        <div className="stats-group">
          <h3>Speed</h3>
          {speedDistributionData.length > 0 && (
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={speedDistributionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8dd1e1" name="Number of Trips" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="stats-grid four-col mt-4">
            <Stat label="Avg. Speed" value={avgSpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} />
            <Stat label="Fastest" value={fastestTripBySpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} onClick={() => fastestTripBySpeedRow && onFocusOnTrip(fastestTripBySpeedRow)} />
            <Stat label="Slowest" value={slowestTripBySpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} onClick={() => slowestTripBySpeedRow && onFocusOnTrip(slowestTripBySpeedRow)} />
            {activeCurrency && costPerDurationByCurrency[activeCurrency] !== undefined && (
              <Stat
                label="Cost per Minute"
                unit={activeCurrency}
                value={costPerDurationByCurrency[activeCurrency]!.toFixed(2)}
              />
            )}
          </div>
        </div>

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
                  <h4 className="text-center text-slate-400 mb-2">Successful Trips</h4>
                  <ResponsiveContainer width="100%" height={500}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={successfulTripsByDayOfWeekData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="day" />
                      <PolarRadiusAxis angle={70} domain={[0, 'dataMax']} />
                      <Radar name="Successful Trips" dataKey="count" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
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

        {productTypeData.length > 0 && (
          <div className="stats-group">
            <h3>Product Types</h3>
            <ResponsiveContainer width="100%" height={700}>
              <Treemap
                data={productTypeData}
                dataKey="size"
                ratio={4 / 3}
                stroke="#fff"
                fill="#8884d8"
                isAnimationActive={false}
                content={renderTreemapContent}
              >
                <Tooltip formatter={(value: number, name: string, props: any) => [props.payload.name.split(' (')[0], `Count: ${value}`]} />
              </Treemap>
            </ResponsiveContainer>
          </div>
        )}
      </div>

  <div className="mb-6">
        <div className="row flex gap-1.5">
          <button onClick={() => handleDownloadKML('both')} disabled={!actionsEnabled}>Download KML (both)</button>
          <button onClick={() => handleDownloadKML('begin')} disabled={!actionsEnabled}>Begintrip KML</button>
          <button onClick={() => handleDownloadKML('drop')} disabled={!actionsEnabled}>Dropoff KML</button>
        </div>
        <div className="footer">KML uses colored icons (green/red). Works in Google Earth / Maps.</div>
      </div>

      <div className="section">
        <input ref={fileInputRef} type="file" accept=".csv" onChange={onFileSelect} disabled={isProcessing} className="block" />
        <div className="footer">Select a new CSV file to replace the current data.</div>
      </div>
    </>
  );
};

interface CustomizedContentProps {
  root: any;
  depth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  colors: string[];
  name: string;
}

const CustomizedContent: React.FC<CustomizedContentProps> = ({ root, depth, x, y, width, height, index, colors, name }) => {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors[index % colors.length],
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }} />
      {depth === 1 ? <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>{name}</text> : null}
    </g>
  );
};

export default Stats;