import React from 'react';
import { CSVRow } from '../../services/csvParser';
import { formatCurrency } from '@/utils/currency';

interface FareSplitStatsProps {
  rows: CSVRow[];
}

interface FareSplitData {
  count: number;
  totalFare: { [currency: string]: number };
}

const FareSplitStats: React.FC<FareSplitStatsProps> = ({ rows }) => {
  const fareSplitData = React.useMemo<FareSplitData>(() => {
    const data: FareSplitData = {
      count: 0,
      totalFare: {},
    };

    rows.forEach(row => {
      if (row.status?.toLowerCase() === 'fare_split') {
        data.count++;
        const fare = parseFloat(row.fare_amount);
        const currency = row.fare_currency;

        if (currency && !isNaN(fare)) {
          data.totalFare[currency] = (data.totalFare[currency] || 0) + fare;
        }
      }
    });

    return data;
  }, [rows]);

  if (fareSplitData.count === 0) {
    return <p className="text-slate-500 text-sm mt-2">No fare split rides found in your data.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      <div>
        <div className="text-slate-400">Rides with Fare Split</div>
        <div className="font-bold text-lg text-slate-100">{fareSplitData.count}</div>
      </div>
      <div className="flex flex-col gap-2">
        {Object.entries(fareSplitData.totalFare).map(([currency, amount]) => (
          <div key={currency}>
            <div className="text-slate-400">Total Fare ({currency})</div>
            <div className="font-bold text-lg text-slate-100">{formatCurrency(amount, currency)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FareSplitStats;