import React from 'react';
import { ResponsiveContainer, Tooltip, Treemap, TooltipProps } from 'recharts';
import { CSVRow } from '../../../services/csvParser';
import { DistanceUnit } from '../../../App';
import { formatCurrency } from '../../../utils/currency';
import { formatDuration } from '../../../utils/formatters';

interface ProductTypeStats {
  name: string;
  size: number;
  totalFare: { [key: string]: number };
  totalDistance: number;
  totalWaitingTime: number;
  totalRidingTime: number;
  successfulTrips: number;
  canceledTrips: number;
  topCity?: string;
  topCityCount?: number;
}

const isTripCompleted = (trip: CSVRow): boolean => {
  return trip.status?.toLowerCase() === 'completed';
};

const CustomTreemapContent = React.memo((props: any) => {
  const { x, y, width, height, index, name, value, colors, metric, distanceUnit, activeCurrency, root } = props;
  const isSmall = width < 80 || height < 40;
  const color = colors[index % colors.length];

  let formattedValue = `${value.toLocaleString()}`;
  if (metric === 'totalFare' && activeCurrency) formattedValue = formatCurrency(value, activeCurrency);
  else if (metric === 'totalDistance') formattedValue = `${value.toFixed(2)} ${distanceUnit}`;
  else if (metric === 'totalWaitingTime' || metric === 'totalRidingTime') formattedValue = formatDuration(value, true);
  else if (metric === 'topCity') {
    const { topCity, topCityCount } = root;
    formattedValue = `${topCity || 'N/A'}: ${topCityCount?.toLocaleString() || 0} trips`;
  }
  else if (metric === 'successfulTrips' || metric === 'canceledTrips' || metric === 'size') formattedValue = `${value.toLocaleString()} trips`;

  return (
    <g>
      <defs>
        <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.9 }} />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={width} height={height} rx={4} ry={4} fill={`url(#grad-${index})`} className="stroke-slate-900/50" strokeWidth={2} />
      <foreignObject x={x} y={y} width={width} height={height}>
        <div className="w-full h-full flex flex-col justify-center items-center p-2 text-white text-center overflow-hidden">
          {!isSmall && (
            <>
              <div className="font-bold text-base truncate w-full">{name}</div>
              <div className="text-sm opacity-80 truncate w-full">{formattedValue}</div>
            </>
          )}
          {isSmall && width > 40 && height > 20 && (
            <div className="font-semibold text-xs truncate w-full">{name}</div>
          )}
        </div>
      </foreignObject>
    </g>
  );
});

interface ProductTypesChartProps {
  rows: CSVRow[];
  distanceUnit: DistanceUnit;
  activeCurrency: string | null;
}

type Metric = 'size' | 'successfulTrips' | 'canceledTrips' | 'totalFare' | 'totalDistance' | 'totalWaitingTime' | 'totalRidingTime' | 'topCity';

const metricOptions: { value: Metric; label: string }[] = [
  { value: 'size', label: 'Requests' },
  { value: 'successfulTrips', label: 'Completed' },
  { value: 'totalFare', label: 'Total Fare' },
  { value: 'totalDistance', label: 'Distance' },
  { value: 'totalRidingTime', label: 'Riding Time' },
  { value: 'totalWaitingTime', label: 'Waiting Time' },
];

const ProductTypesChart: React.FC<ProductTypesChartProps> = ({ rows, distanceUnit, activeCurrency }) => {
  const [metric, setMetric] = React.useState('size');

  const productTypeData = React.useMemo(() => {
    if (!rows || rows.length === 0) {
      return [];
    }
    const statsByProduct = rows.reduce((acc: { [key: string]: Omit<ProductTypeStats, 'name'> & { cityCounts: { [key: string]: number } } }, trip) => {
      const product = trip.product_type || 'N/A';
      if (!acc[product]) {
        acc[product] = {
          size: 0,
          totalFare: {},
          totalDistance: 0,
          totalWaitingTime: 0,
          totalRidingTime: 0,
          successfulTrips: 0,
          canceledTrips: 0,
          cityCounts: {},
        };
      }

      acc[product].size += 1;
      const status = trip.status?.toLowerCase() ?? '';

      const city = trip.city;
      if (city) {
        acc[product].cityCounts[city] = (acc[product].cityCounts[city] || 0) + 1;
      }


      if (isTripCompleted(trip)) {
        acc[product].successfulTrips += 1;
        const fare = parseFloat(trip.fare_amount);
        const currency = trip.fare_currency;
        if (currency && !isNaN(fare)) {
          if (!acc[product].totalFare[currency]) {
            acc[product].totalFare[currency] = 0;
          }
          acc[product].totalFare[currency] += fare;
        }
        const distance = parseFloat(trip.distance);
        if (!isNaN(distance)) {
          acc[product].totalDistance += distanceUnit === 'km' ? distance * 1.60934 : distance;
        }
        if (trip.request_time && trip.begin_trip_time) {
          const waitingTime = (new Date(trip.begin_trip_time).getTime() - new Date(trip.request_time).getTime()) / (1000 * 60);
          if (waitingTime > 0) acc[product].totalWaitingTime += waitingTime;
        }
        if (trip.begin_trip_time && trip.dropoff_time) {
          const ridingTime = (new Date(trip.dropoff_time).getTime() - new Date(trip.begin_trip_time).getTime()) / (1000 * 60);
          if (ridingTime > 0) acc[product].totalRidingTime += ridingTime;
        }
      } else if (status === 'rider_canceled' || status === 'driver_canceled') {
        acc[product].canceledTrips += 1;
      }

      return acc;
    }, {});

    return Object.entries(statsByProduct).map(([name, statsData]) => {
      const { cityCounts, ...stats } = statsData;
      let topCity: string | undefined;
      let topCityCount = 0;

      if (Object.keys(cityCounts).length > 0) {
        [topCity, topCityCount] = Object.entries(cityCounts).reduce((top, current) => current[1] > top[1] ? current : top);
      }

      stats.topCity = topCity;
      stats.topCityCount = topCityCount;

      let value: number | string | undefined = stats[metric as keyof typeof stats];
      if (metric === 'totalFare' && activeCurrency) value = stats.totalFare[activeCurrency] || 0;
      else if (metric === 'topCity') value = stats.topCityCount;
      return {
        name,
        ...stats,
        value: typeof value === 'number' ? value : 0,
      };
    });
  }, [rows, distanceUnit, metric, activeCurrency]);

  const treemapColors = React.useMemo(() => ['#6366f1', '#34d399', '#f59e0b', '#38bdf8', '#fb923c', '#a78bfa', '#ef4444'], []);

  if (productTypeData.length === 0) return null;

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const { name, successfulTrips, canceledTrips, totalFare, totalDistance, totalWaitingTime, totalRidingTime, topCity, topCityCount } = payload[0].payload;
      return (
        <div className="min-w-[250px] rounded-lg border border-slate-700 bg-slate-800/80 p-4 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
          <div className="mb-2 border-b border-slate-700 pb-2">
            <p className="recharts-tooltip-label font-bold text-base">{name}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <div className="text-slate-400">Successful Trips</div><div className="font-medium text-right">{successfulTrips.toLocaleString()}</div>
            <div className="text-slate-400">Cancellations</div><div className="font-medium text-right">{canceledTrips.toLocaleString()}</div>
            <div className="text-slate-400">Total Distance</div><div className="font-medium text-right">{totalDistance.toFixed(2)} {distanceUnit}</div>
            <div className="text-slate-400">Total Waiting</div><div className="font-medium text-right">{formatDuration(totalWaitingTime, true)}</div>
            <div className="text-slate-400">Total Riding</div><div className="font-medium text-right">{formatDuration(totalRidingTime, true)}</div>
            <div className="text-slate-400">Top City</div><div className="font-medium text-right">{topCity || 'N/A'} ({topCityCount?.toLocaleString() || 0})</div>
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

  return (
    <div className="stats-group">
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-slate-400">Breakdown by:</h3>
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-800/50 p-1.5">
        {metricOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setMetric(option.value)}
            disabled={option.value === 'totalFare' && !activeCurrency}
            className={`flex-grow px-3 py-1.5 text-xs font-semibold rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              metric === option.value
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            {option.label}
          </button>
        ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={700}>
        <Treemap
          data={productTypeData}
          dataKey="value"
          aspectRatio={4 / 3}
          isAnimationActive={false}
          animationDuration={500}
          animationEasing="ease-in-out"
          content={<CustomTreemapContent
            metric={metric}
            distanceUnit={distanceUnit}
            activeCurrency={activeCurrency}
            colors={treemapColors}
          />}
          colors={treemapColors}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductTypesChart;