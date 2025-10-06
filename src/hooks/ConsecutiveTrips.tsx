import React from 'react';
import { CSVRow } from '../../services/csvParser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, MapPin } from 'lucide-react';

interface ConsecutiveTripsProps {
  tripChain: CSVRow[];
  onFocusOnTrip: (trip: CSVRow) => void;
}

const ConsecutiveTrips: React.FC<ConsecutiveTripsProps> = ({ tripChain, onFocusOnTrip }) => {
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
      <CardHeader>
        <CardTitle>Longest Consecutive Trip Chain</CardTitle>
        <CardDescription>
          You had a chain of <span className="font-bold text-primary">{tripChain.length}</span> consecutive trips in a single day.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {tripChain.map((trip, index) => (
            <div
              key={trip.trip_uuid || index}
              className="p-3 rounded-md border bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              onClick={() => onFocusOnTrip(trip)}
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsecutiveTrips;