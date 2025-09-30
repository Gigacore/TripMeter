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
        <div>
            <h2>Top Cities</h2>
            <ul>
                {topCities.map((city, index) => (
                    <li key={index} onClick={() => handleCityClick(city.city)} style={{ cursor: 'pointer' }}>
                        {city.city}: {city.count} rides
                    </li>
                ))}
            </ul>

            {selectedCity && (
                <div>
                    <h3>Rides in {selectedCity}</h3>
                    <div className="map-hero">
                        <Map
                            rows={cityRides}
                            focusedTrip={null}
                            distanceUnit="miles"
                            convertDistance={(miles) => miles}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopCities;
