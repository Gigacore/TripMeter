import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, TooltipProps } from 'recharts';
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

const CustomBarTooltip = ({ active, payload, label, activeCurrency }: TooltipProps<number, string> & { activeCurrency: string | null }) => {
  if (active && payload && payload.length && activeCurrency) {
    return (
      <div className="min-w-[200px] rounded-lg border bg-background/80 p-4 text-sm text-foreground shadow-lg backdrop-blur-sm border-border">
        <div className="mb-2 border-b border-border pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{`Fare: ${label} ${activeCurrency}`}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="text-muted-foreground">Trips</div>
          <div className="font-medium text-right text-amber-400">{payload[0].value?.toLocaleString()}</div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomAreaTooltip = ({ active, payload, label, activeCurrency }: TooltipProps<number, string> & { activeCurrency: string | null }) => {
  if (active && payload && payload.length && activeCurrency) {
    return (
      <div className="min-w-[200px] rounded-lg border bg-background/80 p-4 text-sm text-foreground shadow-lg backdrop-blur-sm border-border">
        <div className="mb-2 border-b border-border pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{`Year: ${label}`}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="text-emerald-400">Total Fare</div><div className="font-medium text-right text-emerald-400">{formatCurrency(payload[0].value as number, activeCurrency)}</div>
          <div className="text-muted-foreground">Trips</div><div className="font-medium text-right">{payload[0].payload.count.toLocaleString()}</div>
        </div>
      </div>
    );
  }

  return null;
};

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
    tripsByYear,
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
    <div className="grid grid-cols-1 gap-6">
      {currencies.length > 1 && (
        <div className="border-b border-border">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {currencies.map(currency => (
              <button
                key={currency}
                onClick={() => setActiveCurrency(currency)}
                className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                   activeCurrency === currency
                    ? 'border-emerald-400 text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
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
      {currencies.length > 0 && activeCurrency && (
        <div className="stats-group">
          <h3 className="text-lg font-semibold mb-2">Fare Distribution ({activeCurrency})</h3>
          {fareDistributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fareDistributionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomBarTooltip activeCurrency={activeCurrency} />} cursor={{ fill: 'rgba(61, 91, 131, 0.1)' }} />
                <Bar dataKey="count" fill="#f59e0b" name="Number of Trips" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground text-sm mt-2">No fare data to display for this currency.</p>}
        </div>
      )}
      {activeCurrency && tripsByYear && tripsByYear.length > 0 && (
        <div className="stats-group">
          <h3 className="text-lg font-semibold">Total Fare by Year ({activeCurrency})</h3>
           <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tripsByYear} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="year" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value as number, activeCurrency)} />
              <Tooltip content={<CustomAreaTooltip activeCurrency={activeCurrency} />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
              <Bar dataKey={(payload) => payload.totalFare[activeCurrency] || 0} fill="#10b981" name={`Fare (${activeCurrency})`} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 w-full mt-4">
            <Stat
              label="Avg. Fare"
              value={formatCurrency(avgFareByCurrency[activeCurrency], activeCurrency)}
            />
            {lowestFareByCurrency[activeCurrency] && (
              <Stat
                label="Lowest Fare"
                value={formatCurrency(lowestFareByCurrency[activeCurrency]!.amount, activeCurrency)}
                onClick={() => lowestFareByCurrency[activeCurrency] && onFocusOnTrip(lowestFareByCurrency[activeCurrency]!.row)}
              />
            )}
            {highestFareByCurrency[activeCurrency] && (
              <Stat
                label="Highest Fare"
                value={formatCurrency(highestFareByCurrency[activeCurrency]!.amount, activeCurrency)}
                onClick={() => highestFareByCurrency[activeCurrency] && onFocusOnTrip(highestFareByCurrency[activeCurrency]!.row)}
              />
            )}
          </div>
    </div>
  );
};

export default FareCharts;
