import React from 'react';
import { ResponsiveContainer, Tooltip, Treemap, TooltipProps } from 'recharts';
import { CSVRow } from '../../../services/csvParser';
import { DistanceUnit } from '../../../App';
import { formatCurrency } from '../../../utils/currency';
import { formatDuration } from '../../../utils/formatters';
import CostEfficiencyChart from '../CostEfficiencyChart';

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
  lastRideTime?: number;
  breakdown?: { [key: string]: Omit<ProductTypeStats, 'name' | 'breakdown'> };
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
      <rect x={x} y={y} width={width} height={height} rx={4} ry={4} fill={`url(#grad-${index})`} className="stroke-background/50" strokeWidth={2} />
      <foreignObject x={x} y={y} width={width} height={height} style={{ pointerEvents: 'none' }}>
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
  convertDistance: (miles: number) => number;
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

const ProductTypesChart: React.FC<ProductTypesChartProps> = ({ rows, distanceUnit, activeCurrency, convertDistance }) => {
  const [metric, setMetric] = React.useState('size');

  const productTypeData = React.useMemo(() => {
    if (!rows || rows.length === 0) {
      return [];
    }
    const statsByProduct = rows.reduce((acc: { [key: string]: Omit<ProductTypeStats, 'name'> & { cityCounts: { [key: string]: number }, lastRideTime: number, breakdown?: { [key: string]: any } } }, trip) => {
      const originalProduct = trip.product_type || 'N/A';
      const product = originalProduct.toLowerCase().includes('auto') ? 'Auto' : originalProduct;
      if (!acc[product]) {
        const newStat: Omit<ProductTypeStats, 'name'> & { cityCounts: { [key: string]: number }, lastRideTime: number, breakdown?: { [key: string]: any } } = {
          size: 0,
          totalFare: {},
          totalDistance: 0,
          totalWaitingTime: 0,
          totalRidingTime: 0,
          successfulTrips: 0,
          canceledTrips: 0,
          cityCounts: {},
          lastRideTime: 0,
        };
        if (product === 'Auto') {
          newStat.breakdown = {};
        }
        acc[product] = newStat;
      }


      acc[product].size += 1;
      const status = trip.status?.toLowerCase() ?? '';

      const city = trip.city;
      if (city) {
        acc[product].cityCounts[city] = (acc[product].cityCounts[city] || 0) + 1;
      }

      const requestTime = new Date(trip.request_time).getTime();
      if (!isNaN(requestTime) && requestTime > acc[product].lastRideTime) {
        acc[product].lastRideTime = requestTime;
      }

      if (product === 'Auto') {
        if (!acc.Auto.breakdown![originalProduct]) {
          acc.Auto.breakdown![originalProduct] = {
            size: 0,
            totalFare: {},
            totalDistance: 0,
            totalWaitingTime: 0,
            totalRidingTime: 0,
            successfulTrips: 0,
            canceledTrips: 0,
          };
        }
        acc.Auto.breakdown![originalProduct].size += 1;
      }

      const targetStat = product === 'Auto' ? acc.Auto.breakdown![originalProduct] : acc[product];




      if (isTripCompleted(trip)) {
        acc[product].successfulTrips += 1;
        const fare = parseFloat(trip.fare_amount!);
        const currency = trip.fare_currency!;
        if (currency && !isNaN(fare)) {
          if (!targetStat.totalFare[currency]) {
            targetStat.totalFare[currency] = 0;
          }
          targetStat.totalFare[currency] += fare;
        }
        const distance = parseFloat(trip.distance);
        if (!isNaN(distance)) {
          const convertedDistance = distanceUnit === 'km' ? distance * 1.60934 : distance;
          targetStat.totalDistance += convertedDistance;
          if (product === 'Auto') {
            acc.Auto.totalDistance += convertedDistance;
          }
        }
        if (trip.request_time && trip.begin_trip_time) {
          const waitingTime = (new Date(trip.begin_trip_time).getTime() - new Date(trip.request_time).getTime()) / (1000 * 60);
          if (waitingTime > 0) targetStat.totalWaitingTime += waitingTime;
          if (product === 'Auto' && waitingTime > 0) acc.Auto.totalWaitingTime += waitingTime;
        }
        if (trip.begin_trip_time && trip.dropoff_time) {
          const ridingTime = (new Date(trip.dropoff_time).getTime() - new Date(trip.begin_trip_time).getTime()) / (1000 * 60);
          if (ridingTime > 0) targetStat.totalRidingTime += ridingTime;
          if (product === 'Auto' && ridingTime > 0) acc.Auto.totalRidingTime += ridingTime;
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
      if (metric === 'totalFare' && activeCurrency) {
        value = stats.totalFare[activeCurrency] || 0;
      } else if (metric === 'topCity') {
        value = stats.topCityCount;
      }
      return {
        name,
        ...stats,
        value: typeof value === 'number' ? value : 0,
      };
    });
  }, [rows, distanceUnit, metric, activeCurrency]);

  const treemapColors = React.useMemo(() => ['#6366f1', '#34d399', '#f59e0b', '#38bdf8', '#fb923c', '#a78bfa', '#ef4444'], []);

  if (productTypeData.length === 0) return null;

  // HACK: Using `any` to bypass a type issue with recharts TooltipProps.
  const CustomTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length && payload[0].payload) {
      const { name, successfulTrips, canceledTrips, totalFare, totalDistance, totalWaitingTime, totalRidingTime, topCity, topCityCount, lastRideTime, breakdown } = payload[0].payload;
      return (
        <div className="min-w-[250px] rounded-lg border bg-background/80 p-4 text-sm text-foreground shadow-lg backdrop-blur-sm border-border">
          <div className="mb-2 border-b border-border pb-2">
            <p className="recharts-tooltip-label font-bold text-base">{name} {breakdown && `(${Object.keys(breakdown).length} types)`}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <div className="col-span-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400">Successful: {successfulTrips.toLocaleString()}</span>
                <span className="text-red-400">Canceled: {canceledTrips.toLocaleString()}</span>
              </div>
              <div className="flex h-2 w-full rounded-full overflow-hidden bg-muted">
                <div
                  className="bg-emerald-500"
                  style={{ width: `${(successfulTrips / (successfulTrips + canceledTrips)) * 100}%` }}
                />
                <div
                  className="bg-red-500"
                  style={{ width: `${(canceledTrips / (successfulTrips + canceledTrips)) * 100}%` }}
                />
              </div>
            </div>
            <div className="col-span-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-violet-400">Waiting: {formatDuration(totalWaitingTime, true)}</span>
                <span className="text-sky-400">Riding: {formatDuration(totalRidingTime, true)}</span>
              </div>
              <div className="flex h-2 w-full rounded-full overflow-hidden bg-muted">
                <div
                  className="bg-violet-500"
                  style={{ width: `${(totalWaitingTime / (totalWaitingTime + totalRidingTime)) * 100}%` }}
                />
                <div
                  className="bg-sky-500"
                  style={{ width: `${(totalRidingTime / (totalWaitingTime + totalRidingTime)) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-muted-foreground">Total Distance</div><div className="font-medium text-right">{totalDistance.toFixed(2)} {distanceUnit}</div>
            <div className="text-muted-foreground">Top City</div><div className="font-medium text-right">{topCity || 'N/A'} ({topCityCount?.toLocaleString() || 0})</div>
            {lastRideTime > 0 && <><div className="text-muted-foreground">Last Ride</div><div className="font-medium text-right">{new Date(lastRideTime).toLocaleDateString()}</div></>}
            {Object.entries(totalFare).map(([currency, amount]) => (
              <React.Fragment key={currency}>
                <div className="text-muted-foreground">Total Fare ({currency})</div><div className="font-medium text-right">{formatCurrency(amount as number, currency)}</div>
              </React.Fragment>
            ))}
            {breakdown && (
              <div className="col-span-2 mt-2 pt-2 border-t border-border/50">
                <p className="font-semibold text-xs mb-1">Breakdown:</p>
                <div className="flex flex-col gap-0.5">
                  {Object.entries(breakdown).map(([subName, subStats]: [string, any]) => (
                    <div key={subName} className="flex justify-between text-xs"><span className="text-muted-foreground">{subName}</span> <span className="font-mono">{subStats.size.toLocaleString()}</span></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="stats-group">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-semibold">Product Types</h3>
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted p-1.5">
        {metricOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setMetric(option.value)}
            disabled={option.value === 'totalFare' && !activeCurrency}
            className={`flex-grow px-3 py-1.5 text-xs font-semibold rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              metric === option.value ?
                'bg-primary text-primary-foreground shadow-sm' :
                'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
      <div className="mt-12">
        <h3 className="text-lg font-semibold">Ride Efficiency by Product</h3>
        <p className="text-sm text-muted-foreground mb-4">A comparison of distance per unit of currency across different service types.</p>
        <CostEfficiencyChart
          rows={rows}
          distanceUnit={distanceUnit}
          activeCurrency={activeCurrency}
          convertDistance={convertDistance}
        />
      </div>
    </div>
  );
};

export default ProductTypesChart;
