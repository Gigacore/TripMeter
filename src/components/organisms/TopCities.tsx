import React, { useEffect, useState } from 'react';
import Map from './Map';
import { CSVRow } from '../../services/csvParser';
import { DistanceUnit } from '@/App';
import { formatCurrency } from '@/utils/currency';
import { formatDuration } from '@/utils/formatters';

interface CityStats {
    totalFare: { [key: string]: number };
    totalDistance: number;
    totalRidingTime: number;
    totalWaitingTime: number;
}

interface TopCitiesProps {
    rows: CSVRow[];
    distanceUnit: DistanceUnit;
    convertDistance: (miles: number) => number;
}

interface TopLocation {
    location: { lat: number; lng: number };
    count: number;
}

const TopCities: React.FC<TopCitiesProps> = ({ rows, distanceUnit, convertDistance }) => {
    const [topCities, setTopCities] = useState<{ city: string; count: number }[]>([]);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [cityRides, setCityRides] = useState<CSVRow[]>([]);
    const [cityStats, setCityStats] = useState<CityStats | null>(null);
    const [topPickups, setTopPickups] = useState<TopLocation[]>([]);
    const [topDropoffs, setTopDropoffs] = useState<TopLocation[]>([]);

    useEffect(() => {
        if (rows.length > 0) {
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
                .map(([city, count]) => ({ city, count }))
                .sort((a, b) => b.count - a.count);

            setTopCities(sortedCities.slice(0, 10));
            if (sortedCities.length > 0) {
                setSelectedCity(sortedCities[0].city);
            }
        }
    }, [rows]);

    useEffect(() => {
        if (selectedCity) {
            setCityRides(
                rows.filter((row) => row.city === selectedCity && row.status?.toLowerCase() === 'completed')
            );
        }
    }, [selectedCity, rows]);

    useEffect(() => {
        if (cityRides.length > 0) {
            const stats: CityStats = cityRides.reduce((acc, trip) => {
                const fare = parseFloat(trip.fare_amount);
                const currency = trip.fare_currency;
                if (currency && !isNaN(fare)) {
                    acc.totalFare[currency] = (acc.totalFare[currency] || 0) + fare;
                }

                const distance = parseFloat(trip.distance);
                if (!isNaN(distance)) {
                    acc.totalDistance += convertDistance(distance);
                }

                if (trip.begin_trip_time && trip.dropoff_time) {
                    const ridingTime = (new Date(trip.dropoff_time).getTime() - new Date(trip.begin_trip_time).getTime()) / (1000 * 60);
                    if (ridingTime > 0) acc.totalRidingTime += ridingTime;
                }

                if (trip.request_time && trip.begin_trip_time) {
                    const waitingTime = (new Date(trip.begin_trip_time).getTime() - new Date(trip.request_time).getTime()) / (1000 * 60);
                    if (waitingTime > 0) acc.totalWaitingTime += waitingTime;
                }

                return acc;
            }, {
                totalFare: {},
                totalDistance: 0,
                totalRidingTime: 0,
                totalWaitingTime: 0,
            });
            setCityStats(stats);
        } else {
            setCityStats(null);
        }
    }, [cityRides, convertDistance]);

    useEffect(() => {
        if (cityRides.length > 0) {
            const gridSize = 0.001; // Corresponds to ~111 meters

            const cluster = (latKey: keyof CSVRow, lngKey: keyof CSVRow) => {
                const grid: { [key: string]: { lat: number; lng: number; count: number; addresses: (string | undefined)[] } } = {};

                cityRides.forEach(ride => {
                    const lat = parseFloat(ride[latKey] as string);
                    const lng = parseFloat(ride[lngKey] as string);

                    if (!isNaN(lat) && !isNaN(lng)) {
                        const gridLat = Math.floor(lat / gridSize) * gridSize;
                        const gridLng = Math.floor(lng / gridSize) * gridSize;
                        const key = `${gridLat.toFixed(5)},${gridLng.toFixed(5)}`;

                        if (!grid[key]) {
                            grid[key] = {
                                lat: gridLat + gridSize / 2,
                                lng: gridLng + gridSize / 2,
                                count: 0,
                                addresses: []
                            };
                        }
                        grid[key].count++;
                    }
                });

                return Object.values(grid)
                    .map((data) => {
                        return {
                            location: { lat: data.lat, lng: data.lng },
                            count: data.count,
                        };
                    })
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
            };

            setTopPickups(cluster('pickup_latitude', 'pickup_longitude'));
            setTopDropoffs(cluster('dropoff_latitude', 'dropoff_longitude'));

        } else {
            setTopPickups([]);
            setTopDropoffs([]);
        }
    }, [cityRides]);

    const renderLocationTable = (title: string, data: TopLocation[]) => (
        <div>
            <h4 className="text-md font-semibold mb-2 text-slate-800 dark:text-slate-200">{title}</h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-xs uppercase text-slate-600 dark:text-slate-400">
                        <tr>
                            <th className="px-4 py-2">Location (Lat, Lng)</th>
                            <th className="px-4 py-2 text-right">Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                                <td className="px-4 py-2 font-mono">{item.location.lat.toFixed(4)}, {item.location.lng.toFixed(4)}</td>
                                <td className="px-4 py-2 font-mono text-right">{item.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const handleCityClick = (city: string) => {
        setSelectedCity(city);
    };

    return (
        <div className="stats-group">
            {/* <h3>Top Cities by Completed Trip Count</h3> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="flex flex-col gap-2">
                        {topCities.map((city, index) => (
                        <button
                            key={index}
                            onClick={() => handleCityClick(city.city)}
                            className={`w-full text-left rounded-lg transition-all duration-300 border-2 ${selectedCity === city.city ? 'bg-slate-100 dark:bg-slate-800 border-emerald-500/50' : 'bg-slate-100/50 dark:bg-slate-800/50 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                            <div className="p-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-800 dark:text-slate-200">{index + 1}. {city.city}</span>
                                    <span className="font-mono text-slate-600 dark:text-slate-300">{city.count}</span>
                                </div>
                                <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-transform duration-500 ease-out"
                                        style={{ width: `${(city.count / (topCities[0]?.count || 1)) * 100}%` }}
                                    />
                                </div>
                                {selectedCity === city.city && cityStats && (
                                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400 grid grid-cols-2 gap-x-4 gap-y-2">
                                        <div>
                                            <div className="font-semibold text-slate-700 dark:text-slate-300">Total Fare</div>
                                            {Object.entries(cityStats.totalFare).map(([currency, amount]) => (
                                                <div key={currency}>{formatCurrency(amount, currency)}</div>
                                            ))}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-700 dark:text-slate-300">Total Distance</div>
                                            <div>{cityStats.totalDistance.toFixed(2)} {distanceUnit}</div>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-700 dark:text-slate-300">Riding Time</div>
                                            <div>{formatDuration(cityStats.totalRidingTime, true)}</div>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-700 dark:text-slate-300">Waiting Time</div>
                                            <div>{formatDuration(cityStats.totalWaitingTime, true)}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </button>
                        ))}
                </div>
                <div className="min-h-[300px] md:min-h-0 flex flex-col">
                    {selectedCity && cityRides.length > 0 && (
                        <div className="rounded-lg overflow-hidden flex-grow">
                            <Map
                                rows={cityRides}
                                focusedTrip={null}
                                distanceUnit={distanceUnit}
                                convertDistance={convertDistance}
                            />
                        </div>
                    )}
                </div>
            </div>
            {selectedCity && (topPickups.length > 0 || topDropoffs.length > 0) && (
                <div className="mt-8">
                    <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">Top Locations in {selectedCity}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderLocationTable('Top 5 Pickup Locations', topPickups)}
                        {renderLocationTable('Top 5 Dropoff Locations', topDropoffs)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopCities;
