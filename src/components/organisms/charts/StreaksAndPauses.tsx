import React from 'react';
import { Flame, Pause } from 'lucide-react';
import { TripStats } from '../../../hooks/useTripData';

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
}

const StreaksAndPauses: React.FC<StreaksAndPausesProps> = ({
  longestStreak,
  longestGap,
  longestSuccessfulStreakBeforeCancellation,
  longestCancellationStreak,
  longestSuccessfulStreakBeforeDriverCancellation,
  longestDriverCancellationStreak,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-start gap-4 rounded-lg bg-slate-800/50 p-4">
        <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400">
          <Flame size={24} />
        </div>
        <div>
          <div className="text-slate-400">Longest Streak</div>
          <div className="text-2xl font-bold text-slate-50">{longestStreak.days} {longestStreak.days === 1 ? 'day' : 'days'}</div>
          <div className="text-xs text-slate-500">{formatDateRange(longestStreak.startDate, longestStreak.endDate)}</div>
        </div>
      </div>
      <div className="flex items-start gap-4 rounded-lg bg-slate-800/50 p-4">
        <div className="rounded-full bg-red-500/20 p-2 text-red-400">
          <Pause size={24} />
        </div>
        <div>
          <div className="text-slate-400">Longest Pause</div>
          <div className="text-2xl font-bold text-slate-50">{longestGap.days} {longestGap.days === 1 ? 'day' : 'days'}</div>
          <div className="text-xs text-slate-500">{formatDateRange(longestGap.startDate, longestGap.endDate)}</div>
        </div>
      </div>
      <div className="flex items-start gap-4 rounded-lg bg-slate-800/50 p-4">
        <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400">
          <Flame size={24} />
        </div>
        <div>
          <div className="text-slate-400">Longest Successful Rides Before Any Cancellation</div>
          <div className="text-2xl font-bold text-slate-50">
            {longestSuccessfulStreakBeforeCancellation.count} {longestSuccessfulStreakBeforeCancellation.count === 1 ? 'ride' : 'rides'}
          </div>
          <div className="text-xs text-slate-500">
            {formatDateRange(longestSuccessfulStreakBeforeCancellation.startDate, longestSuccessfulStreakBeforeCancellation.endDate)}
          </div>
        </div>
      </div>
      <div className="flex items-start gap-4 rounded-lg bg-slate-800/50 p-4">
        <div className="rounded-full bg-red-500/20 p-2 text-red-400">
          <Pause size={24} />
        </div>
        <div>
          <div className="text-slate-400">Longest Cancellation Streak (Rider & Driver)</div>
          <div className="text-2xl font-bold text-slate-50">
            {longestCancellationStreak.count} {longestCancellationStreak.count === 1 ? 'cancellation' : 'cancellations'}
          </div>
          <div className="text-xs text-slate-500">
            {formatDateRange(longestCancellationStreak.startDate, longestCancellationStreak.endDate)}
          </div>
        </div>
      </div>
      <div className="flex items-start gap-4 rounded-lg bg-slate-800/50 p-4">
        <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400">
          <Flame size={24} />
        </div>
        <div>
          <div className="text-slate-400">Longest Successful Rides Before Driver Cancellation</div>
          <div className="text-2xl font-bold text-slate-50">
            {longestSuccessfulStreakBeforeDriverCancellation.count} {longestSuccessfulStreakBeforeDriverCancellation.count === 1 ? 'ride' : 'rides'}
          </div>
          <div className="text-xs text-slate-500">
            {formatDateRange(longestSuccessfulStreakBeforeDriverCancellation.startDate, longestSuccessfulStreakBeforeDriverCancellation.endDate)}
          </div>
        </div>
      </div>
      <div className="flex items-start gap-4 rounded-lg bg-slate-800/50 p-4">
        <div className="rounded-full bg-red-500/20 p-2 text-red-400">
          <Pause size={24} />
        </div>
        <div>
          <div className="text-slate-400">Longest Driver Cancellation Streak</div>
          <div className="text-2xl font-bold text-slate-50">
            {longestDriverCancellationStreak.count} {longestDriverCancellationStreak.count === 1 ? 'cancellation' : 'cancellations'}
          </div>
          <div className="text-xs text-slate-500">
            {formatDateRange(longestDriverCancellationStreak.startDate, longestDriverCancellationStreak.endDate)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreaksAndPauses;
