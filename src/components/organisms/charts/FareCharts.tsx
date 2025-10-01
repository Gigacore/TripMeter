import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, AreaChart, Legend, Area } from 'recharts';
import { formatCurrency } from '../../../utils/currency';
import { CSVRow } from '../../../services/csvParser';
import { TripStats } from '../../../hooks/useTripData';
import Stat from '../../atoms/Stat';

interface FareChartsProps {
  data: TripStats;
  rows: CSVRow[];
  activeCurrency: string | null;
  setActiveCurrency: (currency: string) => void;
  onFocusOnTrip: (tripRow: CSVRow) => void;
}

const FareCharts: React.FC<FareChartsProps> = ({
  data,
  rows,
  activeCurrency,
  setActiveCurrency,
  onFocusOnTrip,
}) => {
  const {
    totalFareByCurrency,
    avgFareByCurrency,
    lowestFareByCurrency,
    highestFareByCurrency,
    totalFareByYear,
  } = data;

  const currencies = Object.keys(totalFareByCurrency);

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
                    {formatCurrency(totalFareByCurrency[currency], currency)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="section">
        {currencies.length > 0 && activeCurrency && (
          <div className="stats-group">
            <h3>Fare Distribution</h3>
            <div className="flex gap-4">
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
                      value={formatCurrency(avgFareByCurrency[activeCurrency], activeCurrency)}
                    />
                    {lowestFareByCurrency[activeCurrency] && (
                      <Stat
                        label="Lowest Fare"
                        unit={activeCurrency}
                        value={formatCurrency(lowestFareByCurrency[activeCurrency]!.amount, activeCurrency)}
                        onClick={() => lowestFareByCurrency[activeCurrency] && onFocusOnTrip(lowestFareByCurrency[activeCurrency]!.row)}
                      />
                    )}
                    {highestFareByCurrency[activeCurrency] && (
                      <Stat
                        label="Highest Fare"
                        unit={activeCurrency}
                        value={formatCurrency(highestFareByCurrency[activeCurrency]!.amount, activeCurrency)}
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
          <h3>Fare by Year</h3>
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
              <Tooltip formatter={(value: number) => [formatCurrency(value, activeCurrency), `Total Fare (${activeCurrency})`]} />
              <Legend />
              <Area type="monotone" dataKey="total" stroke="#10b981" fillOpacity={1} fill="url(#colorTotalFare)" name={`Fare (${activeCurrency})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
};

export default FareCharts;