import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, TooltipProps } from 'recharts';
import { Map } from 'lucide-react';
import { formatCurrency } from '../../../utils/currency';
import { CSVRow } from '../../../services/csvParser';
import { TripStats } from '../../../hooks/useTripData';
import Stat from '../../atoms/Stat';
import RequestsMapModal from '../RequestsMapModal';
import { DistanceUnit } from '../../../App';

interface FareChartsProps {
  data: TripStats;
  rows: CSVRow[];
  activeCurrency: string | null;
  setActiveCurrency: (currency: string) => void;
  onFocusOnTrips: (tripRows: CSVRow[], title?: string) => void;
  distanceUnit: DistanceUnit;
  convertDistance: (miles: number) => number;
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
  onFocusOnTrips = () => { }, // Add a default empty function
  distanceUnit,
  convertDistance,
}) => {
  const {
    totalFareByCurrency,
    avgFareByCurrency,
    lowestFareByCurrency,
    highestFareByCurrency,
    tripsByYear,
  } = data;

  const currencies = Object.keys(totalFareByCurrency);

  const completedTrips = React.useMemo(() => {
    return rows.filter(row => row.status?.toLowerCase() === 'completed');
  }, [rows]);

  const { lowestFare, highestFare, lowestFareRow, highestFareRow } = React.useMemo(() => {
    if (!activeCurrency) return { lowestFare: null, highestFare: null, lowestFareRow: null, highestFareRow: null };

    const faresInCurrency = completedTrips
      .filter(row => row.fare_currency === activeCurrency && row.fare_amount)
      .map(row => ({ row, amount: parseFloat(row.fare_amount!) }));

    if (faresInCurrency.length === 0) return { lowestFare: null, highestFare: null, lowestFareRow: null, highestFareRow: null };

    const minEntry = faresInCurrency.reduce((min, current) => current.amount < min.amount ? current : min);
    const maxEntry = faresInCurrency.reduce((max, current) => current.amount > max.amount ? current : max);

    return {
      lowestFare: { amount: minEntry.amount },
      highestFare: { amount: maxEntry.amount },
      lowestFareRow: minEntry.row,
      highestFareRow: maxEntry.row,
    };
  }, [completedTrips, activeCurrency]);

  const fareDistributionData = React.useMemo(() => {
    if (!completedTrips || completedTrips.length === 0 || !activeCurrency) return [];
    const fares = completedTrips
      .filter(r => r.fare_currency === activeCurrency && r.fare_amount && parseFloat(r.fare_amount) > 0)
      .map(r => parseFloat(r.fare_amount));
    if (fares.length === 0) return [];

    const maxFare = Math.max(...fares);
    const bucketCount = 10;
    const bucketSize = maxFare > 0 ? Math.ceil(maxFare / bucketCount) : 1;
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
  }, [completedTrips, activeCurrency]);

  const handleFocusOnTripsByFare = (amount: number) => {
    if (!activeCurrency) return;
    const trips = completedTrips.filter(
      (row) =>
        row.fare_currency === activeCurrency &&
        row.fare_amount &&
        parseFloat(row.fare_amount) === amount
    );
    if (trips.length > 0) {
      const title = `${trips.length} trip${trips.length > 1 ? 's' : ''} with fare ${formatCurrency(amount, activeCurrency)}`;
      onFocusOnTrips(trips, title);
    }
  };

  const lowestFareTripsCount = lowestFare
    ? completedTrips.filter(r => r.fare_currency === activeCurrency && parseFloat(r.fare_amount!) === lowestFare.amount).length
    : 0;
  const highestFareTripsCount = highestFare
    ? completedTrips.filter(r => r.fare_currency === activeCurrency && parseFloat(r.fare_amount!) === highestFare.amount).length
    : 0;

  return (
    <div className="grid grid-cols-1 gap-6">
      {currencies.length > 1 && (
        <div className="border-b border-border">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {currencies.map(currency => (
              <button
                key={currency}
                onClick={() => setActiveCurrency(currency)}
                className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${activeCurrency === currency
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

        {lowestFare && lowestFareRow ? (
          <RequestsMapModal
            rows={[lowestFareRow]}
            distanceUnit={distanceUnit}
            convertDistance={convertDistance}
            title="Lowest Fare"
            renderTripStat={(trip) => (
              <div className="text-xs font-medium text-green-600 dark:text-green-400">
                Fare: {formatCurrency(parseFloat(trip.fare_amount!), trip.fare_currency!)}
              </div>
            )}
          >
            <div className="cursor-pointer hover:bg-muted transition-colors duration-200 rounded-lg">
              <Stat
                label="Lowest Fare"
                value={formatCurrency(lowestFare.amount, activeCurrency)}
                subValue={
                  lowestFareTripsCount > 1 ? (
                    `(${lowestFareTripsCount} trips)`
                  ) : undefined
                }
                valueIcon={lowestFareTripsCount === 1 ? <Map size={16} /> : undefined}
              />
            </div>
          </RequestsMapModal>
        ) : lowestFare ? (
          <Stat
            label="Lowest Fare"
            value={formatCurrency(lowestFare.amount, activeCurrency)}
            subValue={lowestFareTripsCount > 1 ? `(${lowestFareTripsCount} trips)` : undefined}
            onClick={() => handleFocusOnTripsByFare(lowestFare.amount)}
          />
        ) : null}

        {highestFare && highestFareRow ? (
          <RequestsMapModal
            rows={[highestFareRow]}
            distanceUnit={distanceUnit}
            convertDistance={convertDistance}
            title="Highest Fare"
            renderTripStat={(trip) => (
              <div className="text-xs font-medium text-green-600 dark:text-green-400">
                Fare: {formatCurrency(parseFloat(trip.fare_amount!), trip.fare_currency!)}
              </div>
            )}
          >
            <div className="cursor-pointer hover:bg-muted transition-colors duration-200 rounded-lg">
              <Stat
                label="Highest Fare"
                value={formatCurrency(highestFare.amount, activeCurrency)}
                subValue={
                  highestFareTripsCount > 1 ? (
                    `(${highestFareTripsCount} trips)`
                  ) : undefined
                }
                valueIcon={highestFareTripsCount === 1 ? <Map size={16} /> : undefined}
              />
            </div>
          </RequestsMapModal>
        ) : highestFare ? (
          <Stat
            label="Highest Fare"
            value={formatCurrency(highestFare.amount, activeCurrency)}
            subValue={highestFareTripsCount > 1 ? `(${highestFareTripsCount} trips)` : undefined}
            onClick={() => handleFocusOnTripsByFare(highestFare.amount)}
          />
        ) : null}
      </div>
    </div>
  );
};

export default FareCharts;
