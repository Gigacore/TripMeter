import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, TooltipProps } from 'recharts';
import { CSVRow } from '../../../services/csvParser';

interface TripDurationDistributionProps {
    rows: CSVRow[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="min-w-[150px] rounded-lg border bg-background/80 p-4 text-sm text-foreground shadow-lg backdrop-blur-sm border-border">
                <div className="mb-2 border-b border-border pb-2">
                    <p className="recharts-tooltip-label font-bold text-base">{`${label} minutes`}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div className="text-muted-foreground">Trips</div>
                    <div className="font-medium text-right text-indigo-400">{payload[0].value}</div>
                </div>
            </div>
        );
    }
    return null;
};

const TripDurationDistribution: React.FC<TripDurationDistributionProps> = ({ rows }) => {
    const data = useMemo(() => {
        const durations: number[] = [];
        rows.forEach(row => {
            if (row.status?.toLowerCase() === 'completed' && row.begin_trip_time && row.dropoff_time) {
                const begin = new Date(row.begin_trip_time);
                const end = new Date(row.dropoff_time);
                if (!isNaN(begin.getTime()) && !isNaN(end.getTime()) && end > begin) {
                    const durationMinutes = (end.getTime() - begin.getTime()) / (1000 * 60);
                    if (durationMinutes > 0 && durationMinutes < 1440) { // Sanity check
                        durations.push(durationMinutes);
                    }
                }
            }
        });

        if (durations.length === 0) return [];

        const bucketSize = 5; // 5 minute buckets
        const maxDuration = Math.ceil(Math.max(...durations) / bucketSize) * bucketSize;
        const buckets = Array.from({ length: maxDuration / bucketSize }, (_, i) => ({
            range: `${i * bucketSize}-${(i + 1) * bucketSize}`,
            count: 0,
            min: i * bucketSize,
            max: (i + 1) * bucketSize
        }));

        durations.forEach(d => {
            const bucketIndex = Math.min(Math.floor(d / bucketSize), buckets.length - 1);
            buckets[bucketIndex].count++;
        });

        // Filter out empty tail buckets if desired, but keeping them shows distribution better
        // Let's just return all buckets up to the max duration found
        return buckets;
    }, [rows]);

    if (data.length === 0) {
        return <p className="text-muted-foreground text-sm mt-2">No completed trip data available for duration analysis.</p>;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                    dataKey="range"
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Duration (minutes)', position: 'insideBottom', offset: -5, fontSize: 12, fill: '#888' }}
                />
                <YAxis
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Trips" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default TripDurationDistribution;
