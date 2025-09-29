import React from 'react';
import Stat from '../atoms/Stat';
import { formatDuration } from '../../utils/formatters';
import { TripStats } from '../../hooks/useTripData';
import { DistanceUnit } from '../../App';

interface TopStatsProps {
  tripData: TripStats;
  distanceUnit: DistanceUnit;
}

const TopStats: React.FC<TopStatsProps> = ({ tripData, distanceUnit }) => {
  const {
    totalTrips,
    totalFareByCurrency,
    totalCompletedDistance,
    totalTripDuration,
  } = tripData;

  return (
    <div className="top-stats-bar">
      <Stat label="Total Requests" value={totalTrips} />
      {Object.entries(totalFareByCurrency).map(([currency, fare]) => (
        <Stat
          key={currency}
          label="Total Fare"
          value={fare.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          unit={currency}
        />
      ))}
      <Stat label="Total Distance" value={totalCompletedDistance.toFixed(2)} unit={distanceUnit} />
      <Stat label="Total Time" value={formatDuration(totalTripDuration, true)} />
    </div>
  );
};

export default TopStats;