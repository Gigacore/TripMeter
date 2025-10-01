import React from 'react';
import { ResponsiveContainer, Tooltip, Treemap } from 'recharts';
import { CSVRow } from '../../../services/csvParser';
import { DistanceUnit } from '../../../App';
import { getCurrencyCode } from './currency';
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

const CustomTreemapContent = (props: any, metric: string, distanceUnit: DistanceUnit, activeCurrency: string | null, treemapColors: string[]) => {
  const { depth, x, y, width, height, index, name, value, colors } = props;
  const isSmall = width < 150 || height < 50;

  let formattedValue = `${value.toLocaleString()}`;
  if (metric === 'totalFare' && activeCurrency) formattedValue = value.toLocaleString(undefined, { style: 'currency', currency: getCurrencyCode(activeCurrency) });
  else if (metric === 'totalDistance') formattedValue = `${value.toFixed(2)} ${distanceUnit}`;
  else if (metric === 'totalWaitingTime' || metric === 'totalRidingTime') formattedValue = formatDuration(value, true);
  else if (metric === 'topCity') {
    const { topCity, topCityCount } = props;
    formattedValue = `${topCity || 'N/A'}: ${topCityCount?.toLocaleString() || 0} trips`;
  }
  else if (metric === 'successfulTrips' || metric === 'canceledTrips' || metric === 'size') formattedValue = `${value.toLocaleString()} trips`;

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
      {!isSmall && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={14}>
          <tspan x={x + width / 2} dy="-0.5em" className="font-semibold">{name}</tspan>
          <tspan x={x + width / 2} dy="1.2em">{formattedValue}</tspan>
        </text>
      )}
    </g>
  );
};

interface ProductTypesChartProps {
  rows: CSVRow[];
  distanceUnit: DistanceUnit;
  activeCurrency: string | null;
}

const metricOptions = [
  { value: 'size', label: 'Total Requests' },
  { value: 'successfulTrips', label: 'Successful Trips' },
  { value: 'canceledTrips', label: 'Canceled Trips' },
  { value: 'totalFare', label: 'Total Fare' },
  { value: 'totalDistance', label: 'Total Distance' },
  { value: 'totalWaitingTime', label: 'Total Waiting Time' },
  { value: 'totalRidingTime', label: 'Total Riding Time' },
  { value: 'topCity', label: 'Top City' },
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
      const status = trip.status?.toLowerCase();

      const city = trip.city;
      if (city) {
        acc[product].cityCounts[city] = (acc[product].cityCounts[city] || 0) + 1;
      }


      if (status === 'completed') {
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

  const treemapColors = React.useMemo(() => ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'], []);

  if (productTypeData.length === 0) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, successfulTrips, canceledTrips, totalFare, totalDistance, totalWaitingTime, totalRidingTime, topCity, topCityCount } = payload[0].payload;
      return (
        <div className="recharts-default-tooltip rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
          <p className="recharts-tooltip-label">{name}</p>
          <ul className="recharts-tooltip-item-list">
            <li className="recharts-tooltip-item">Successful Trips: {successfulTrips.toLocaleString()}</li>
            <li className="recharts-tooltip-item">Cancellations: {canceledTrips.toLocaleString()}</li>
            <li className="recharts-tooltip-item">Total Distance: {totalDistance.toFixed(2)} {distanceUnit}</li>
            <li className="recharts-tooltip-item">Total Waiting: {formatDuration(totalWaitingTime, true)}</li>
            <li className="recharts-tooltip-item">Total Riding: {formatDuration(totalRidingTime, true)}</li>
            <li className="recharts-tooltip-item">Top City: {topCity || 'N/A'} ({topCityCount?.toLocaleString() || 0} trips)</li>
            {Object.entries(totalFare).map(([currency, amount]) => (
              <li key={currency} className="recharts-tooltip-item">
                Total Fare ({currency}): {(amount as number).toLocaleString(undefined, { style: 'currency', currency: getCurrencyCode(currency), minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="stats-group">
      <h3>Product Types</h3>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-slate-800 mb-4 -mt-2">
        {metricOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setMetric(option.value)}
            disabled={option.value === 'totalFare' && !activeCurrency}
            className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 disabled:cursor-not-allowed disabled:text-slate-600 ${
              metric === option.value
                ? 'border-emerald-400 text-slate-100'
                : 'border-transparent text-slate-400 hover:text-slate-200 active:bg-slate-800'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={700}>
        <Treemap
          data={productTypeData}
          dataKey="value"
          ratio={4 / 3}
          stroke="#fff"
          fill="#8884d8"
          isAnimationActive={false}
          content={(props) => CustomTreemapContent(props, metric, distanceUnit, activeCurrency, treemapColors)}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductTypesChart;