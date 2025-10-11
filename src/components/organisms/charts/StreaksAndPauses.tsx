import React from 'react';
import { Flame, Pause, CalendarDays, Link2, Zap, Award, Ban, ShieldCheck, UserX } from 'lucide-react';
import { TripStats } from '../../../hooks/useTripData';
import { CSVRow } from '@/services/csvParser';

const formatDateRange = (start: number | null, end: number | null): string | null => {
  if (!start || !end) return null;
  const startDate = new Date(start).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  const endDate = new Date(end).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  if (startDate === endDate) return startDate;
  return `${startDate} - ${endDate}`;
};

const formatDate = (date: number | null): string | null => {
  if (!date) return null;
  return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-4 rounded-lg bg-muted/50 p-4">
          <div className="rounded-full bg-purple-500/20 p-2 text-purple-400">
            <Zap size={24} />
          </div>
          <div>
            <div className="text-muted-foreground">Busiest Day</div>
            <p className="text-xs text-muted-foreground/80 -mt-1 mb-1">Most trips taken in a single day.</p>
            <div className="text-2xl font-bold text-foreground">{mostTripsInADay.count} {mostTripsInADay.count === 1 ? 'trip' : 'trips'}</div>
            <div className="text-xs text-muted-foreground">{formatDate(mostTripsInADay.date)}</div>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg bg-muted/50 p-4">
          <div className="rounded-full bg-blue-500/20 p-2 text-blue-400">
            <Link2 size={24} />
          </div>
          <div>
            <div className="text-muted-foreground">Longest Trip Chain</div>
            <p className="text-xs text-muted-foreground/80 -mt-1 mb-1">Most consecutive back-to-back trips.</p>
            <div className="text-2xl font-bold text-foreground">{longestConsecutiveTripsChain.length} {longestConsecutiveTripsChain.length === 1 ? 'trip' : 'trips'}</div>
            <div className="text-xs text-muted-foreground">
              {longestConsecutiveTripsChain.length > 0 && (
                <button
                  onClick={() => onFocusOnTrip(longestConsecutiveTripsChain[0])}
                  className="text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                  aria-label={`Focus on the start of the longest trip chain of ${longestConsecutiveTripsChain.length} trips`}
                >
                  View on map
                </button>
              )}
            </div>
          </div>
        </div>
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
          <div className="rounded-full bg-yellow-500/20 p-2 text-yellow-400">
            <Award size={24} />
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
          <div className="rounded-full bg-red-500/20 p-2 text-red-400">
            <Ban size={24} />
          </div>
          <div>
            <div className="text-muted-foreground">Rider Cancellation Streak</div>
            <p className="text-xs text-muted-foreground/80 -mt-1 mb-1">Most consecutive rider cancellations.</p>
            <div className="text-2xl font-bold text-foreground">
              {longestCancellationStreak.count} {longestCancellationStreak.count === 1 ? 'cancellation' : 'cancellations'}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDateRange(longestCancellationStreak.startDate, longestCancellationStreak.endDate)}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg bg-muted/50 p-4">
          <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400">
            <ShieldCheck size={24} />
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
          <div className="rounded-full bg-orange-500/20 p-2 text-orange-400">
            <UserX size={24} />
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
  );
};

export default StreaksAndPauses;
