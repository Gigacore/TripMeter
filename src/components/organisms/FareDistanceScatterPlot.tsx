import React from 'react';
import { ResponsiveContainer, ScatterChart, CartesianGrid, XAxis, YAxis, Tooltip, Scatter, TooltipProps } from 'recharts';
import { CSVRow } from '../../services/csvParser';
import { DistanceUnit } from '../../App';
import { formatCurrency } from '../../utils/currency';

interface FareDistanceScatterPlotProps {
  rows: CSVRow[];
  distanceUnit: DistanceUnit;
  activeCurrency: string | null;
  convertDistance: (miles: number) => number;
}

const CustomTooltip = ({ active, payload, distanceUnit, activeCurrency }: TooltipProps<number, string> & { distanceUnit: DistanceUnit, activeCurrency: string | null }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const { distance, fare, product_type, city } = data;

    return (
      <div className="min-w-[200px] rounded-lg border border-slate-700 bg-slate-800/80 p-4 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <div className="mb-2 border-b border-slate-700 pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{product_type || 'Trip'}</p>
          {city && <p className="text-xs text-slate-400">{city}</p>}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="text-slate-400">Distance</div><div className="font-medium text-right">{distance.toFixed(2)} {distanceUnit}</div>
          {activeCurrency && <div className="text-slate-400">Fare</div>}
          {activeCurrency && <div className="font-medium text-right">{formatCurrency(fare, activeCurrency)}</div>}
        </div>
      </div>
    );
  }
  return null;
};

const FareDistanceScatterPlot: React.FC<FareDistanceScatterPlotProps> = ({ rows, distanceUnit, activeCurrency, convertDistance }) => {
  const scatterData = React.useMemo(() => {
    if (!rows || !activeCurrency) return [];
    return rows
      .filter(row =>
        row.status?.toLowerCase() === 'completed' &&
        row.fare_currency === activeCurrency &&
        row.distance && parseFloat(row.distance) > 0 &&
        row.fare_amount && parseFloat(row.fare_amount) > 0
      )
      .map(row => ({
        distance: convertDistance(parseFloat(row.distance!)),
        fare: parseFloat(row.fare_amount!),
        product_type: row.product_type,
        city: row.city,
      }));
  }, [rows, activeCurrency, convertDistance]);

  if (scatterData.length === 0) {
    return <p className="text-slate-500 text-sm mt-2">Not enough data to display fare vs. distance for the selected currency.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={500}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis type="number" dataKey="distance" name="Distance" unit={distanceUnit} stroke="#888" fontSize={12} />
        <YAxis type="number" dataKey="fare" name="Fare" unit={activeCurrency || ''} stroke="#888" fontSize={12} tickFormatter={(value) => formatCurrency(value as number, activeCurrency!, { notation: 'compact' })} />
        <Tooltip content={<CustomTooltip distanceUnit={distanceUnit} activeCurrency={activeCurrency} />} cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Trips" data={scatterData} fill="#8884d8" fillOpacity={0.6} />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default FareDistanceScatterPlot;