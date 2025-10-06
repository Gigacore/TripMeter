import React from 'react';
import { Flame, Pause, MapPin, MoreVertical } from 'lucide-react';
import { TripStats } from '../../../hooks/useTripData';
import { CSVRow } from '@/services/csvParser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Map from '../Map';
import { cn } from '@/lib/utils';

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
  onFocusOnTrip: (trip: CSVRow) => void;
}

const StreaksAndPauses: React.FC<StreaksAndPausesProps> = ({
  longestStreak,
  longestGap,
  longestSuccessfulStreakBeforeCancellation,
  longestCancellationStreak,
  longestSuccessfulStreakBeforeDriverCancellation,
  longestDriverCancellationStreak,
  longestConsecutiveTripsChain,
  onFocusOnTrip,
}) => {
  const [selectedTrip, setSelectedTrip] = React.useState<CSVRow | null>(null);

  const handleTripClick = (trip: CSVRow) => {
    onFocusOnTrip(trip);
    setSelectedTrip(trip);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-4 rounded-lg bg-muted/50 p-4">
          <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400">
            <Flame size={24} />
          </div>
          <div>
            <div className="text-muted-foreground">Longest Streak</div>
            <div className="text-2xl font-bold text-foreground">{longestStreak.days} {longestStreak.days === 1 ? 'day' : 'days'}</div>
            <div className="text-xs text-muted-foreground">{formatDateRange(longestStreak.startDate, longestStreak.endDate)}</div>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg bg-muted/50 p-4">
          <div className="rounded-full bg-red-500/20 p-2 text-red-400">
            <Pause size={24} />
          </div>
          <div>
            <div className="text-muted-foreground">Longest Pause</div>
            <div className="text-2xl font-bold text-foreground">{longestGap.days} {longestGap.days === 1 ? 'day' : 'days'}</div>
            <div className="text-xs text-muted-foreground">{formatDateRange(longestGap.startDate, longestGap.endDate)}</div>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg bg-muted/50 p-4">
          <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400">
            <Flame size={24} />
          </div>
          <div>
            <div className="text-muted-foreground">Longest Successful Rides Before Any Cancellation</div>
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
            <Pause size={24} />
          </div>
          <div>
            <div className="text-muted-foreground">Longest Cancellation Streak (Rider & Driver)</div>
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
            <Flame size={24} />
          </div>
          <div>
            <div className="text-muted-foreground">Longest Successful Rides Before Driver Cancellation</div>
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
            <Pause size={24} />
          </div>
          <div>
            <div className="text-muted-foreground">Longest Driver Cancellation Streak</div>
            <div className="text-2xl font-bold text-foreground">
              {longestDriverCancellationStreak.count} {longestDriverCancellationStreak.count === 1 ? 'cancellation' : 'cancellations'}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDateRange(longestDriverCancellationStreak.startDate, longestDriverCancellationStreak.endDate)}
            </div>
          </div>
        </div>
      </div>
      {longestConsecutiveTripsChain && longestConsecutiveTripsChain.length >= 2 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Longest Consecutive Trip Chain</CardTitle>
            <CardDescription>
              You had a chain of <span className="font-bold text-primary">{longestConsecutiveTripsChain.length}</span> trips where each one started near the previous one's drop-off on the same day.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <div className="relative overflow-auto h-[400px] rounded-lg border p-2">
                  <div className="relative flex flex-col gap-2">
                    {longestConsecutiveTripsChain.map((trip, index) => (
                      <React.Fragment key={trip.trip_uuid || index}>
                        <div
                          className={cn(
                            "p-3 rounded-md bg-card hover:bg-muted/50 transition-colors cursor-pointer border",
                            selectedTrip?.trip_uuid === trip.trip_uuid && "bg-primary/10 border-primary/30"
                          )}
                          onClick={() => handleTripClick(trip)}
                        >
                          <div className="flex items-center justify-between text-sm font-medium">
                            <span>Trip #{index + 1}</span>
                            <span className="text-xs text-muted-foreground">{new Date(trip.request_time!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 flex items-start gap-2">
                            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-500" />
                            <span className="truncate" title={trip.begintrip_address}>{trip.begintrip_address || 'N/A'}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-start gap-2">
                            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-500" />
                            <span className="truncate" title={trip.dropoff_address}>{trip.dropoff_address || 'N/A'}</span>
                          </div>
                        </div>
                        {index < longestConsecutiveTripsChain.length - 1 && <MoreVertical className="absolute left-1/2 -translate-x-1/2 h-4 w-4 text-muted-foreground" style={{ top: `${(index + 1) * 88 - 10}px`}} />}
                      </React.Fragment>
                    ))}
                      </div>
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                </div>
              </div>
              <div className="w-full h-96 lg:h-auto min-h-[400px] rounded-lg shadow-sm overflow-hidden">
                <Map
                  rows={longestConsecutiveTripsChain}
                  focusedTrip={selectedTrip}
                  distanceUnit="miles"
                  convertDistance={(m) => m}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StreaksAndPauses;
