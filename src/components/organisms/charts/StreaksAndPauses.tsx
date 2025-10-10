import React from 'react';
import { Flame, Pause } from 'lucide-react';
import { TripStats } from '../../../hooks/useTripData';
import { CSVRow } from '@/services/csvParser';
import MostTripsInADay from '../MostTripsInADay';
import ConsecutiveTrips from '../ConsecutiveTrips';

const formatDateRange = (start: number | null, end: number | null): string | null => {
  if (!start || !end) return null;
  const startDate = new Date(start).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  const endDate = new Date(end).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  if (startDate === endDate) return startDate;
  return `${startDate} - ${endDate}`;
};

interface StreaksAndPausesProps {
  longestStreak: TripStats['longestStreak'];
  longestGap: TripStats['longestGap'];
  longestSuccessfulStreakBeforeCancellation: TripStats['longestSuccessfulStreakBeforeCancellation'];
  longestCancellationStreak: TripStats['longestCancellationStreak'];
  longestSuccessfulStreakBeforeDriverCancellation: TripStats['longestSuccessfulStreakBeforeDriverCancellation'];
  longestDriverCancellationStreak: TripStats['longestDriverCancellationStreak'];
  longestConsecutiveTripsChain: CSVRow[];
  mostTripsInADay: TripStats['mostSuccessfulTripsInADay'];
  onFocusOnTrip: (trip: CSVRow) => void;
}

const StreaksAndPauses: React.FC<StreaksAndPausesProps> = ({
  longestStreak,
  longestGap,
  mostTripsInADay,
  longestSuccessfulStreakBeforeCancellation,
  longestCancellationStreak,
  longestSuccessfulStreakBeforeDriverCancellation,
  longestDriverCancellationStreak,
  longestConsecutiveTripsChain,
  onFocusOnTrip,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <MostTripsInADay mostTripsInADay={mostTripsInADay} />
      <ConsecutiveTrips tripChain={longestConsecutiveTripsChain} onFocusOnTrip={onFocusOnTrip} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-4 rounded-lg bg-muted/50 p-4">
          <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400">
            <Flame size={24} />
          </div>
          <div>
            <div className="text-muted-foreground">Longest Trip Streak</div>
            <p className="text-xs text-muted-foreground/80 -mt-1 mb-1">Consecutive days with at least one trip.</p>
            <div className="text-2xl font-bold text-foreground">{longestStreak.days} {longestStreak.days === 1 ? 'day' : 'days'}</div>
            <div className="text-xs text-muted-foreground">{formatDateRange(longestStreak.startDate, longestStreak.endDate)}</div>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg bg-muted/50 p-4">
          <div className="rounded-full bg-slate-500/20 p-2 text-slate-400">
            <Pause size={24} />
          </div>
          <div>
            <div className="text-muted-foreground">Longest Break</div>
            <p className="text-xs text-muted-foreground/80 -mt-1 mb-1">Consecutive days with no trips.</p>
            <div className="text-2xl font-bold text-foreground">{longestGap.days} {longestGap.days === 1 ? 'day' : 'days'}</div>
            <div className="text-xs text-muted-foreground">{formatDateRange(longestGap.startDate, longestGap.endDate)}</div>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg bg-muted/50 p-4">
          <div className="rounded-full bg-green-500/20 p-2 text-green-400">
            <Flame size={24} />
          </div>
          <div>
            <div className="text-muted-foreground">Uninterrupted Ride Streak</div>
            <p className="text-xs text-muted-foreground/80 -mt-1 mb-1">Most completed rides before any cancellation.</p>
            <div className="text-2xl font-bold text-foreground">
              {longestSuccessfulStreakBeforeCancellation.count} {longestSuccessfulStreakBeforeCancellation.count === 1 ? 'ride' : 'rides'}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDateRange(longestSuccessfulStreakBeforeCancellation.startDate, longestSuccessfulStreakBeforeCancellation.endDate)}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg bg-muted/50 p-4">
          <div className="rounded-full bg-orange-500/20 p-2 text-orange-400">
            <Flame size={24} />
          </div>
          <div>
            <div className="text-muted-foreground">Cancellation Streak</div>
            <p className="text-xs text-muted-foreground/80 -mt-1 mb-1">Most consecutive cancellations (rider or driver).</p>
            <div className="text-2xl font-bold text-foreground">
              {longestCancellationStreak.count} {longestCancellationStreak.count === 1 ? 'cancellation' : 'cancellations'}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDateRange(longestCancellationStreak.startDate, longestCancellationStreak.endDate)}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg bg-muted/50 p-4">
          <div className="rounded-full bg-green-500/20 p-2 text-green-400">
            <Flame size={24} />
          </div>
          <div>
            <div className="text-muted-foreground">Driver-Cancellation-Free Streak</div>
            <p className="text-xs text-muted-foreground/80 -mt-1 mb-1">Most completed rides before a driver cancellation.</p>
            <div className="text-2xl font-bold text-foreground">
              {longestSuccessfulStreakBeforeDriverCancellation.count} {longestSuccessfulStreakBeforeDriverCancellation.count === 1 ? 'ride' : 'rides'}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDateRange(longestSuccessfulStreakBeforeDriverCancellation.startDate, longestSuccessfulStreakBeforeDriverCancellation.endDate)}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg bg-muted/50 p-4">
          <div className="rounded-full bg-red-500/20 p-2 text-red-400">
            <Flame size={24} />
          </div>
          <div>
            <div className="text-muted-foreground">Driver Cancellation Streak</div>
            <p className="text-xs text-muted-foreground/80 -mt-1 mb-1">Most consecutive driver cancellations.</p>
            <div className="text-2xl font-bold text-foreground">
              {longestDriverCancellationStreak.count} {longestDriverCancellationStreak.count === 1 ? 'cancellation' : 'cancellations'}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDateRange(longestDriverCancellationStreak.startDate, longestDriverCancellationStreak.endDate)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreaksAndPauses;
