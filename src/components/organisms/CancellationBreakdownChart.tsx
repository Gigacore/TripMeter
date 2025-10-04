import React, { useState, useRef, useCallback } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, TooltipProps, } from 'recharts';
import { CSVRow } from '../../services/csvParser';
import { DistanceUnit } from '@/App';
import { formatCurrency } from '@/utils/currency';

interface CancellationBreakdownChartProps {
  rows: CSVRow[];
  distanceUnit: DistanceUnit;
  convertDistance: (miles: number) => number;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((acc, entry) => acc + (entry.value as number), 0);
    return (
      <div className="min-w-[200px] rounded-lg border bg-background/80 p-4 text-sm text-foreground shadow-lg backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <p className="recharts-tooltip-label font-bold text-base mb-2 border-b border-slate-200 pb-2 dark:border-slate-700">{`Hour: ${label}:00`}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {payload.map(entry => (
            <React.Fragment key={entry.name}>
              <div style={{ color: entry.color }}>{entry.name}</div>
              <div className="font-medium text-right" style={{ color: entry.color }}>{entry.value?.toLocaleString()}</div>
            </React.Fragment>
          ))}
          <div className="text-muted-foreground border-t border-slate-200/50 pt-1.5 mt-1 dark:border-slate-700/50">Total</div>
          <div className="font-medium text-right border-t border-slate-200/50 pt-1.5 mt-1 dark:border-slate-700/50">{total.toLocaleString()}</div>
        </div>
      </div>
    );
  }
  return null;
};

interface CancellationsWithFareCardProps {
  title: string;
  description: string;
  count: number;
  totalFare: { [currency: string]: number };
}

const CancellationsWithFareCard: React.FC<CancellationsWithFareCardProps> = ({ title, description, count, totalFare }) => {
  const currencies = Object.entries(totalFare);
  const [activeCurrencyIndex, setActiveCurrencyIndex] = useState(0);
  const swipeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handlePrevCurrency = useCallback(() => {
    setActiveCurrencyIndex((prevIndex) => (prevIndex - 1 + currencies.length) % currencies.length);
  }, [currencies.length]);

  const handleNextCurrency = useCallback(() => {
    setActiveCurrencyIndex((prevIndex) => (prevIndex + 1) % currencies.length);
  }, [currencies.length]);

  const handleSwipeStart = useCallback((clientX: number) => {
    if (currencies.length <= 1) return;
    setIsDragging(true);
    setStartX(clientX);
  }, [currencies.length]);

  const handleSwipeMove = useCallback((clientX: number) => {
    if (!isDragging || currencies.length <= 1) return;
    const diff = startX - clientX;
    if (Math.abs(diff) > 50) { // Swipe threshold
      if (diff > 0) {
        handleNextCurrency();
      } else {
        handlePrevCurrency();
      }
      setIsDragging(false); // End swipe after one move
    }
  }, [isDragging, currencies.length, startX, handleNextCurrency, handlePrevCurrency]);

  const handleSwipeEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => handleSwipeStart(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => handleSwipeMove(e.touches[0].clientX);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => handleSwipeStart(e.clientX);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => handleSwipeMove(e.clientX);

  const handleMouseLeave = () => {
    if (isDragging) handleSwipeEnd();
  };

  return (
    <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/50">
      <h4 className="font-semibold text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground mt-1 mb-3">{description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Rides</div>
          <div className="font-bold text-lg text-foreground">{count}</div>
        </div>
        <div className="flex flex-col">
          <div className="flex-grow" ref={swipeRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleSwipeEnd} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleSwipeEnd} onMouseLeave={handleMouseLeave}>
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${activeCurrencyIndex * 100}%)` }}>
                {currencies.map(([currency, amount]) => (
                  <div key={currency} className="w-full flex-shrink-0">
                    <div className="text-muted-foreground">Amount Charged</div>
                    <div className="font-bold text-lg text-foreground">{formatCurrency(amount, currency)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {currencies.length > 1 && (
            <div className="mt-auto flex items-center justify-start gap-2 pt-2">
              {currencies.map((_, index) => (<button key={index} onClick={() => setActiveCurrencyIndex(index)} className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${activeCurrencyIndex === index ? 'w-3 bg-emerald-500' : 'bg-slate-400 hover:bg-slate-500 dark:bg-slate-600 dark:hover:bg-slate-500'}`} aria-label={`Go to currency ${index + 1}`} />))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CancellationBreakdownChart: React.FC<CancellationBreakdownChartProps> = ({ rows, distanceUnit, convertDistance }) => {
  const cancellationData = React.useMemo(() => {
    const hourlyCancellations: { [hour: number]: { rider: number; driver: number } } =
      Array.from({ length: 24 }, () => ({ rider: 0, driver: 0 }));

    rows.forEach(row => {
      const status = row.status?.toLowerCase();
      if ((status === 'rider_canceled' || status === 'driver_canceled') && row.request_time) {
        const hour = new Date(row.request_time).getUTCHours();
        if (status === 'rider_canceled') {
          hourlyCancellations[hour].rider++;
        } else {
          hourlyCancellations[hour].driver++;
        }
      }
    });

    return Object.entries(hourlyCancellations).map(([hour, counts]) => ({
      hour: parseInt(hour, 10),
      riderCanceled: counts.rider,
      driverCanceled: counts.driver,
    }));
  }, [rows]);

  const driverCancellationsWithFare = React.useMemo(() => {
    let count = 0;
    const totalFare: { [currency: string]: number } = {};

    rows.forEach(row => {
      const status = row.status?.toLowerCase();
      const fare = row.fare_amount ? parseFloat(row.fare_amount) : 0;

      if (status === 'driver_canceled' && fare > 0) {
        count++;

        const currency = row.fare_currency;
        if (currency) {
          totalFare[currency] = (totalFare[currency] || 0) + fare;
        }
      }
    });

    return { count, totalFare };
  }, [rows]);

  const riderCancellationsWithFare = React.useMemo(() => {
    let count = 0;
    const totalFare: { [currency: string]: number } = {};

    rows.forEach(row => {
      const status = row.status?.toLowerCase();
      const fare = row.fare_amount ? parseFloat(row.fare_amount) : 0;

      if (status === 'rider_canceled' && fare > 0) {
        count++;

        const currency = row.fare_currency;
        if (currency) {
          totalFare[currency] = (totalFare[currency] || 0) + fare;
        }
      }
    });

    return { count, totalFare };
  }, [rows]);

  const hasChartData = cancellationData.some(d => d.riderCanceled > 0 || d.driverCanceled > 0);

  if (!hasChartData && driverCancellationsWithFare.count === 0 && riderCancellationsWithFare.count === 0) {
    return <p className="text-muted-foreground text-sm mt-2">No cancellation data to display.</p>;
  }

  return (
    <>
      {hasChartData && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cancellationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="hour" unit=":00" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
            <Bar
              dataKey="riderCanceled"
              stackId="a"
              fill="#f97316" // orange-500
              name="Rider Canceled"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="driverCanceled"
              stackId="a"
              fill="#ef4444" // red-500
              name="Driver Canceled"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
      {driverCancellationsWithFare.count > 0 && (
        <CancellationsWithFareCard
          title="Driver Cancellations After Trip Start"
          description="Rides that were canceled by the driver after the trip had started."
          count={driverCancellationsWithFare.count}
          totalFare={driverCancellationsWithFare.totalFare}
        />
      )}
      {riderCancellationsWithFare.count > 0 && (
        <CancellationsWithFareCard
          title="Rider Cancellations After Trip Start"
          description="Rides that were canceled by you after the trip had started."
          count={riderCancellationsWithFare.count}
          totalFare={riderCancellationsWithFare.totalFare}
        />
      )}
    </>
  );
};

export default CancellationBreakdownChart;