import React from 'react';
import { CSVRow } from '../../services/csvParser';
import { formatCurrency } from '@/utils/currency';
import { formatDuration } from '@/utils/formatters';
import { Clock, Route, Wallet, Hourglass } from 'lucide-react';

interface BusiestDayStatsProps {
  trips: CSVRow[];
}

interface DayStats {
  totalDistance: number;
  totalFare: { [currency: string]: number };
  totalRidingTime: number;
  totalWaitingTime: number;
}

const BusiestDayStats: React.FC<BusiestDayStatsProps> = ({ trips }) => {
  const stats = React.useMemo<DayStats>(() => {
    return trips.reduce<DayStats>((acc, trip) => {
      // Distance
      const distance = parseFloat(trip.distance);
      if (!isNaN(distance)) {
        acc.totalDistance += distance;
      }

      // Fare
      const fare = parseFloat(trip.fare_amount);
      const currency = trip.fare_currency;
      if (currency && !isNaN(fare)) {
        acc.totalFare[currency] = (acc.totalFare[currency] || 0) + fare;
      }

      // Riding Time
      if (trip.begin_trip_time && trip.dropoff_time) {
        const ridingTime = (new Date(trip.dropoff_time).getTime() - new Date(trip.begin_trip_time).getTime()) / (1000 * 60);
        if (ridingTime > 0) acc.totalRidingTime += ridingTime;
      }

      // Waiting Time
      if (trip.request_time && trip.begin_trip_time) {
        const waitingTime = (new Date(trip.begin_trip_time).getTime() - new Date(trip.request_time).getTime()) / (1000 * 60);
        if (waitingTime > 0) acc.totalWaitingTime += waitingTime;
      }

      return acc;
    }, {
      totalDistance: 0,
      totalFare: {},
      totalRidingTime: 0,
      totalWaitingTime: 0,
    });
  }, [trips]);

  const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
      <div className="text-primary">{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatItem icon={<Route size={20} />} label="Total Distance" value={`${stats.totalDistance.toFixed(2)} miles`} />
      <StatItem icon={<Clock size={20} />} label="Total Riding Time" value={formatDuration(stats.totalRidingTime, true)} />
      <StatItem icon={<Hourglass size={20} />} label="Total Waiting Time" value={formatDuration(stats.totalWaitingTime, true)} />
      <StatItem icon={<Wallet size={20} />} label="Total Fare" value={
        Object.entries(stats.totalFare).map(([currency, amount]) => (
          <div key={currency}>{formatCurrency(amount, currency)}</div>
        ))
      } />
    </div>
  );
};

export default BusiestDayStats;