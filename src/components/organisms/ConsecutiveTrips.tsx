import React from 'react';
import { CSVRow } from '../../services/csvParser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, MoreVertical } from 'lucide-react';
import Map from './Map';
import { cn } from '@/lib/utils';

interface ConsecutiveTripsProps {
  tripChain: CSVRow[];
  onFocusOnTrip: (trip: CSVRow) => void;
}

const ConsecutiveTrips: React.FC<ConsecutiveTripsProps> = ({ tripChain, onFocusOnTrip }) => {
  const [selectedTrip, setSelectedTrip] = React.useState<CSVRow | null>(null);

  const handleTripClick = (trip: CSVRow) => {
    onFocusOnTrip(trip);
    setSelectedTrip(trip);
  };

  if (!tripChain || tripChain.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Longest Consecutive Trip Chain</CardTitle>
          <CardDescription>A chain of trips where the start of one is near the end of the previous one on the same day.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No consecutive trip chains of 2 or more trips found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Longest Consecutive Trip Chain</CardTitle>
        <CardDescription>
          You had a chain of <span className="font-bold text-primary">{tripChain.length}</span> trips where each one started near the previous one's drop-off on the same day.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <div className="relative overflow-auto h-[400px] rounded-lg border p-2">
              <div className="relative flex flex-col gap-2">
                {tripChain.map((trip, index) => (
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
                    {index < tripChain.length - 1 && <MoreVertical className="absolute left-1/2 -translate-x-1/2 h-4 w-4 text-muted-foreground" style={{ top: `${(index + 1) * 88 - 10}px`}} />}
                  </React.Fragment>
                ))}
                  </div>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
            </div>
          </div>
          <div className="w-full h-96 lg:h-auto min-h-[400px] rounded-lg shadow-sm overflow-hidden">
            <Map
              rows={tripChain}
              focusedTrip={selectedTrip}
              distanceUnit="miles"
              convertDistance={(m) => m}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsecutiveTrips;