import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, TooltipProps } from 'recharts';
import { CSVRow } from '../../services/csvParser';
import { DistanceUnit } from '@/App';
import { formatCurrency } from '../../utils/currency';

interface CostEfficiencyChartProps {
  rows: CSVRow[];
  distanceUnit: DistanceUnit;
  activeCurrency: string | null;
  convertDistance: (miles: number) => number;
}

const CustomTooltip = ({ active, payload, label, distanceUnit, activeCurrency }: TooltipProps<number, string> & { distanceUnit: DistanceUnit, activeCurrency: string | null }) => {
  if (active && payload && payload.length && activeCurrency) {
    const data = payload[0].payload;
    return (
      <div className="min-w-[200px] rounded-lg border border-slate-700 bg-slate-800/80 p-4 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <p className="recharts-tooltip-label font-bold text-base mb-2 border-b border-slate-700 pb-2">{label}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="text-emerald-400">Distance per {formatCurrency(1, activeCurrency, { symbol: '' })}</div>
          <div className="font-medium text-right text-emerald-400">{data.distancePerFare.toFixed(2)} {distanceUnit}</div>
          <div className="text-slate-400">Total Fare</div>
          <div className="font-medium text-right">{formatCurrency(data.totalFare, activeCurrency)}</div>
          <div>Total Trips</div>
          <div className="font-medium text-right">{data.tripCount.toLocaleString()}</div>
        </div>
      </div>
    );
  }
  return null;
};

const CostEfficiencyChart: React.FC<CostEfficiencyChartProps> = ({ rows, distanceUnit, activeCurrency, convertDistance }) => {
  const efficiencyData = React.useMemo(() => {
    if (!rows || !activeCurrency) return [];

    const statsByProduct: { [key: string]: { totalFare: number; totalDistance: number; tripCount: number } } = {};

    rows.forEach(row => {
      if (row.status?.toLowerCase() !== 'completed' || !row.product_type || row.fare_currency !== activeCurrency) return;

      if (!statsByProduct[row.product_type]) {
        statsByProduct[row.product_type] = { totalFare: 0, totalDistance: 0, tripCount: 0 };
      }

      const fare = parseFloat(row.fare_amount);
      const distance = parseFloat(row.distance);

      if (!isNaN(fare) && !isNaN(distance) && distance > 0) {
        statsByProduct[row.product_type].totalFare += fare;
        statsByProduct[row.product_type].totalDistance += convertDistance(distance);
        statsByProduct[row.product_type].tripCount++;
      }
    });

    return Object.entries(statsByProduct)
      .map(([productType, stats]) => ({
        productType,
        distancePerFare: stats.totalFare > 0 ? stats.totalDistance / stats.totalFare : 0,
        totalFare: stats.totalFare,
        tripCount: stats.tripCount,
      }))
      .filter(d => d.distancePerFare > 0)
      .sort((a, b) => a.distancePerFare - b.distancePerFare);
  }, [rows, activeCurrency, convertDistance]);

  if (efficiencyData.length === 0) {
    return <p className="text-slate-500 text-sm mt-2">Not enough data to calculate cost efficiency for the selected currency.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart data={efficiencyData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis type="number" stroke="#888" fontSize={12} unit={` ${distanceUnit}`} />
        <YAxis type="category" dataKey="productType" stroke="#888" fontSize={12} width={100} interval={0} />
        <Tooltip content={<CustomTooltip distanceUnit={distanceUnit} activeCurrency={activeCurrency} />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
        <Bar dataKey="distancePerFare" fill="#34d399" name={`Distance per ${formatCurrency(1, activeCurrency, { symbol: '' })}`} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CostEfficiencyChart;