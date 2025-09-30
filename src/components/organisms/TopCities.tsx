import React, { useEffect, useState } from 'react';
import Map from './Map';
import { CSVRow } from '../../services/csvParser';

interface TopCitiesProps {
    rows: CSVRow[];
}

const TopCities: React.FC<TopCitiesProps> = ({ rows }) => {
    const [topCities, setTopCities] = useState<{ city: string; count: number }[]>([]);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [cityRides, setCityRides] = useState<CSVRow[]>([]);

    useEffect(() => {
        if (rows.length > 0) {
            const cityCounts: { [key: string]: number } = {};
            rows.forEach((row) => {
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
            setCityRides(rows.filter((row) => row.city === selectedCity));
        }
    }, [selectedCity, rows]);

    const handleCityClick = (city: string) => {
        setSelectedCity(city);
    };

    return (
        <div className="stats-group">
            <h3>Top 10 Cities by Trip Count</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="flex flex-col gap-2">
                        {topCities.map((city, index) => (
                        <div
                            key={index}
                            onClick={() => handleCityClick(city.city)}
                            className={`rounded-md cursor-pointer transition-all duration-200 ${selectedCity === city.city ? 'bg-slate-700 shadow-lg' : 'bg-slate-800/50 hover:bg-slate-800'}`}
                        >
                            <div className="p-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-200">{index + 1}. {city.city}</span>
                                    <span className="font-mono text-slate-300">{city.count}</span>
                                </div>
                                <div className="mt-2 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${(city.count / (topCities[0]?.count || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                        ))}
                </div>
                <div className="min-h-[300px] md:min-h-0 flex flex-col">
                    {selectedCity && cityRides.length > 0 && (
                        <div className="rounded-lg overflow-hidden flex-grow">
                            <Map
                                rows={cityRides}
                                focusedTrip={null}
                                distanceUnit="miles"
                                convertDistance={(miles) => miles}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopCities;
