import React from 'react';
import { CSVRow } from '../../services/csvParser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Maximize, Link2 } from 'lucide-react';
import Map from './Map';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '../ui/button';

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
    <Dialog>
      <Card className="flex items-center justify-between p-4">
        <div>
          <CardHeader className="p-2">
            <CardTitle className="flex items-center gap-2"><Link2 className="text-primary" /> Trip Chain</CardTitle>
            <CardDescription className="mt-1">Your longest chain of consecutive trips in a single day.</CardDescription>
          </CardHeader>
          <div className="p-2 flex items-baseline gap-3">
            <div className="text-4xl font-bold text-primary">{tripChain.length}</div>
            <div className="text-sm text-muted-foreground"><p className="font-semibold text-card-foreground">Trips</p>in a row</div>
          </div>
        </div>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Maximize className="h-4 w-4" />
            <span className="sr-only">View Details</span>
          </Button>
        </DialogTrigger>
      </Card>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Longest Consecutive Trip Chain</DialogTitle>
          <DialogDescription>
            You had a chain of <span className="font-bold text-primary">{tripChain.length}</span> trips where each one started near the previous one's drop-off on the same day.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
          <div className="relative overflow-auto h-[400px] lg:h-auto border rounded-lg">
            {tripChain.map((trip, index) => (
              <div
                key={trip.trip_uuid || index}
                className={cn(
                  "p-3 border-b last:border-b-0 bg-card hover:bg-muted/50 transition-colors cursor-pointer",
                  selectedTrip?.trip_uuid === trip.trip_uuid && "bg-primary/10"
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
            ))}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
          <div className="w-full h-96 lg:h-auto min-h-[400px] rounded-lg shadow-sm overflow-hidden">
            <Map
              rows={tripChain}
              focusedTrip={selectedTrip}
              distanceUnit="miles"
              convertDistance={(m) => m}
              locations={[]}
              selectedLocation={null}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ConsecutiveTrips;