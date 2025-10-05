import React,
{ useState, useRef, useCallback } from 'react';
import Stat from '../atoms/Stat';
import { formatDuration } from '../../utils/formatters';
import { formatCurrency } from '../../utils/currency';
import { TripStats } from '../../hooks/useTripData';
import { DistanceUnit } from '../../App';
import { CheckCircle, Wallet, Route, Clock, TrendingUp } from 'lucide-react';

interface TopStatsProps {
  tripData: TripStats;
  distanceUnit: DistanceUnit;
}

const TopStats: React.FC<TopStatsProps> = ({ tripData, distanceUnit }) => {
  const {
    successfulTrips,
    totalFareByCurrency,
    totalCompletedDistance,
    totalTripDuration,
    costPerDistanceByCurrency,
  } = tripData;

  const currencies = Object.entries(totalFareByCurrency);
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

  const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    unit?: string;
    children?: React.ReactNode;
    className?: string;
  }> = ({ icon, label, value, unit, children, className = '' }) => (
    <div className={`flex flex-col rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-100/80 to-slate-200/70 p-4 backdrop-blur-sm dark:border-slate-700 dark:from-slate-800/80 dark:to-slate-900/70 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
        <div className="text-emerald-500">{icon}</div>
      </div>
      <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
        {value}
        {unit && <span className="ml-1 text-xl font-medium text-slate-500 dark:text-slate-400">{unit}</span>}
      </div>
      {children}
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-4 py-3 md:grid-cols-4 lg:grid-cols-4">
      <StatCard icon={<CheckCircle size={20} />} label="Completed Rides" value={successfulTrips} />
      {currencies.length > 0 && (
        <>
          {currencies.length === 1 && (
            <StatCard
              icon={<Wallet size={20} />}
              label={`Total Fare (${currencies[0][0]})`}
              value={formatCurrency(currencies[0][1], currencies[0][0])}
            />
          )}
          {currencies.length > 1 && (
            <div className="relative flex flex-col rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-100/80 to-slate-200/70 p-4 backdrop-blur-sm dark:border-slate-700 dark:from-slate-800/80 dark:to-slate-900/70">
              <div className="flex-grow ">
                <div
                  ref={swipeRef}
                  className="h-full cursor-grab active:cursor-grabbing"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleSwipeEnd}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleSwipeEnd}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="overflow-hidden">
                    <div
                      className="flex transition-transform duration-300 ease-in-out"
                      style={{ transform: `translateX(-${activeCurrencyIndex * 100}%)` }}
                    >
                      {currencies.map(([currency, fare]) => (
                        <div key={currency} className="w-full flex-shrink-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Fare</span>
                            <div className="text-emerald-500"><Wallet size={20} /></div>
                          </div>
                          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                            {formatCurrency(fare, currency)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-center gap-2 pt-3">
                {currencies.map((_, index) => (
                  <button key={index} onClick={() => setActiveCurrencyIndex(index)} className={`h-2 w-2 rounded-full transition-all duration-300 ${activeCurrencyIndex === index ? 'w-4 bg-emerald-500' : 'bg-slate-400 hover:bg-slate-500 dark:bg-slate-600 dark:hover:bg-slate-500'}`} aria-label={`Go to currency ${index + 1}`} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
      <StatCard icon={<Route size={20} />} label="Total Distance" value={totalCompletedDistance.toFixed(2)} unit={distanceUnit}>
        {currencies.length > 0 && costPerDistanceByCurrency[currencies[activeCurrencyIndex][0]] && (
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <TrendingUp size={14} className="text-muted-foreground" />
            <span>{formatCurrency(costPerDistanceByCurrency[currencies[activeCurrencyIndex][0]], currencies[activeCurrencyIndex][0])} per {distanceUnit}</span>
          </div>
        )}
      </StatCard>
      <StatCard icon={<Clock size={20} />} label="Total Ride Time" value={formatDuration(totalTripDuration, true)} />
    </div>
  );
};

export default TopStats;