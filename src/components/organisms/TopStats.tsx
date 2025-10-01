import React,
{ useState, useRef, useCallback } from 'react';
import Stat from '../atoms/Stat';
import { formatDuration } from '../../utils/formatters';
import { formatCurrency } from '../../utils/currency';
import { TripStats } from '../../hooks/useTripData';
import { DistanceUnit } from '../../App';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 rounded-b-2xl border-x border-b border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm md:gap-6">
      <Stat label="Completed Rides" value={successfulTrips} />
      {currencies.length > 0 && (
        <>
          {currencies.length === 1 && (
            <Stat
              key={currencies[0][0]}
              label="Total Fare"
              value={formatCurrency(currencies[0][1], currencies[0][0])}
            />
          )}
          {currencies.length > 1 && (
            <div className="relative flex flex-col items-center gap-2">
              <button onClick={handlePrevCurrency} className="absolute -left-6 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white" aria-label="Previous currency">
                <ChevronLeft size={16} />
              </button>
              <div
                ref={swipeRef}
                className="min-w-[180px] cursor-grab text-center active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleSwipeEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleSwipeEnd}
                onMouseLeave={handleMouseLeave}
              >
                <div className="overflow-hidden">
                  <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${activeCurrencyIndex * 100}%)` }}>
                    {currencies.map(([currency, fare]) => (
                      <div key={currency} className="w-full flex-shrink-0">
                        <Stat label="Total Fare" value={formatCurrency(fare, currency)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                {currencies.map((_, index) => (
                  <button key={index} onClick={() => setActiveCurrencyIndex(index)} className={`h-2 w-2 rounded-full transition-all duration-300 ${activeCurrencyIndex === index ? 'w-4 bg-emerald-500' : 'bg-slate-600 hover:bg-slate-500'}`} aria-label={`Go to currency ${index + 1}`} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
      <Stat label="Total Distance" value={totalCompletedDistance.toFixed(2)} unit={distanceUnit} />
      <Stat label="Total Ride Time" value={formatDuration(totalTripDuration, true)} />
    </div>
  );
};

export default TopStats;