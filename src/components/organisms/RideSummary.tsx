import React, { useMemo, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TripStats } from '../../hooks/useTripData';
import { CSVRow } from '../../services/csvParser';
import { DistanceUnit } from '../../App';
import { formatCurrency } from '../../utils/currency';
import { formatDuration } from '../../utils/formatters';
import { MapPin, Calendar, Wallet, Clock, Route, Car, Award, CheckCircle } from 'lucide-react';

interface RideSummaryProps {
    data: TripStats;
    rows: CSVRow[];
    distanceUnit: DistanceUnit;
}

const RideSummary: React.FC<RideSummaryProps> = ({ data, rows, distanceUnit }) => {
    const {
        successfulTrips,
        totalCompletedDistance,
        totalFareByCurrency,
        mostSuccessfulTripsInADay,
        avgCompletedDistance,
        avgTripDuration,
        totalTripDuration,
    } = data;

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

    const mostVisitedCity = useMemo(() => {
        if (!rows || rows.length === 0) return null;
        const cityCounts: { [key: string]: number } = {};
        rows
            .filter(row => row.status?.toLowerCase() === 'completed')
            .forEach((row) => {
                const city = row.city;
                if (city) {
                    cityCounts[city] = (cityCounts[city] || 0) + 1;
                }
            });

        const sortedCities = Object.entries(cityCounts)
            .sort((a, b) => b[1] - a[1]);

        return sortedCities.length > 0 ? sortedCities[0] : null;
    }, [rows]);

    const firstRideDate = useMemo(() => {
        if (!rows || rows.length === 0) return null;
        const completedTrips = rows
            .filter(row => row.status?.toLowerCase() === 'completed' && row.request_time)
            .map(row => new Date(row.request_time).getTime())
            .sort((a, b) => a - b);

        return completedTrips.length > 0 ? completedTrips[0] : null;
    }, [rows]);

    const primaryCurrency = currencies.length > 0 ? currencies[0] : null;

    if (successfulTrips === 0) {
        return null;
    }

    const SummaryItem = ({
        icon: Icon,
        label,
        value,
        subtext,
        colorClass = "text-gray-600 dark:text-gray-400",
        bgClass = "bg-gray-100 dark:bg-gray-800"
    }: {
        icon: any,
        label: string,
        value: React.ReactNode,
        subtext?: string,
        colorClass?: string,
        bgClass?: string
    }) => (
        <div className="flex flex-col p-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-gray-100 dark:border-gray-800 h-full transition-all hover:shadow-md hover:bg-white/80 dark:hover:bg-black/80">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                <div className={`p-2 rounded-xl ${bgClass} ${colorClass}`}>
                    <Icon size={18} />
                </div>
            </div>
            <div className="mt-auto">
                <div className="text-2xl font-bold text-foreground tracking-tight">{value}</div>
                {subtext && <p className="text-xs text-muted-foreground mt-1 font-medium">{subtext}</p>}
            </div>
        </div>
    );

    return (
        <Card className="bg-white/90 dark:bg-black/90 backdrop-blur-xl border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />
            <CardHeader className="pb-6 pt-6">
                <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20">
                        <Car size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Ride Summary</CardTitle>
                        <CardDescription className="text-base">Your travel history analysis</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
                {/* Hero Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryItem
                        icon={CheckCircle}
                        label="Completed Rides"
                        value={successfulTrips}
                        subtext="Total successful trips"
                        colorClass="text-blue-600 dark:text-blue-400"
                        bgClass="bg-blue-50 dark:bg-blue-900/20"
                    />
                    {currencies.length > 0 && (
                        <div className="sm:col-span-2 lg:col-span-1">
                            {currencies.length === 1 ? (
                                <SummaryItem
                                    icon={Wallet}
                                    label={`Total Spend (${currencies[0][0]})`}
                                    value={formatCurrency(currencies[0][1], currencies[0][0])}
                                    subtext="Total spend"
                                    colorClass="text-purple-600 dark:text-purple-400"
                                    bgClass="bg-purple-50 dark:bg-purple-900/20"
                                />
                            ) : (
                                <div className="group relative flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-black/50 p-4 h-full hover:shadow-md transition-all hover:bg-white/80 dark:hover:bg-black/80">
                                    <div className="flex-grow overflow-hidden">
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
                                            <div
                                                className="flex transition-transform duration-300 ease-in-out"
                                                style={{ transform: `translateX(-${activeCurrencyIndex * 100}%)` }}
                                            >
                                                {currencies.map(([currency, fare]) => (
                                                    <div key={currency} className="w-full flex-shrink-0 flex flex-col h-full">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Spend ({currency})</p>
                                                            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                                                <Wallet size={18} />
                                                            </div>
                                                        </div>
                                                        <div className="mt-auto">
                                                            <div className="text-2xl font-bold text-foreground tracking-tight">{formatCurrency(fare, currency)}</div>
                                                            <p className="text-xs text-muted-foreground mt-1 font-medium">Swipe for more</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5">
                                        {currencies.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setActiveCurrencyIndex(index)}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${activeCurrencyIndex === index ? 'w-4 bg-purple-600 dark:bg-purple-400' : 'w-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600'}`}
                                                aria-label={`Go to currency ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <SummaryItem
                        icon={Route}
                        label="Total Distance"
                        value={`${totalCompletedDistance.toFixed(2)} ${distanceUnit}`}
                        subtext="Total distance covered"
                        colorClass="text-emerald-600 dark:text-emerald-400"
                        bgClass="bg-emerald-50 dark:bg-emerald-900/20"
                    />
                    <SummaryItem
                        icon={Clock}
                        label="Total Ride Time"
                        value={formatDuration(totalTripDuration, true)}
                        subtext="Time spent in rides"
                        colorClass="text-amber-600 dark:text-amber-400"
                        bgClass="bg-amber-50 dark:bg-amber-900/20"
                    />
                </div>

                {/* Insights Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-900/30">
                        <div className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                            <Award size={18} />
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground block text-xs uppercase tracking-wider font-medium mb-0.5">Avg. Trip</span>
                            <span className="font-bold text-foreground text-base">{avgCompletedDistance.toFixed(1)} {distanceUnit}</span>
                            <span className="text-muted-foreground text-xs ml-1">({formatDuration(avgTripDuration, true)})</span>
                        </div>
                    </div>

                    {firstRideDate && (
                        <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-900/30">
                            <div className="p-2 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400">
                                <Calendar size={18} />
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-medium mb-0.5">First Ride</span>
                                <span className="font-bold text-foreground text-base">
                                    {new Date(firstRideDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    )}

                    {mostVisitedCity && (
                        <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-900/30">
                            <div className="p-2 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400">
                                <MapPin size={18} />
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground block text-xs uppercase tracking-wider font-medium mb-0.5">Top City</span>
                                <span className="font-bold text-foreground text-base">{mostVisitedCity[0]}</span>
                                <span className="text-muted-foreground text-xs ml-1">({mostVisitedCity[1]} rides)</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default RideSummary;
