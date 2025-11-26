import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, MapPin, Maximize } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CSVRow } from '@/services/csvParser';
import Map from './Map';
import BusiestDayStats from './BusiestDayStats';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface MostTripsInADayProps {
  mostTripsInADay: {
    count: number;
    date: number | null;
    trips: CSVRow[];
  };
}

const MostTripsInADay: React.FC<MostTripsInADayProps> = ({ mostTripsInADay }) => {
  const [selectedTrip, setSelectedTrip] = React.useState<CSVRow | null>(null);

  if (!mostTripsInADay || mostTripsInADay.count < 2) {
    return null; // Don't show if the max is less than 2
  }

  const formattedDate = mostTripsInADay.date
    ? new Date(mostTripsInADay.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
    : 'N/A';

  return (
    <Dialog>
      <Card className="flex items-center justify-between p-4">
        <div>
          <CardHeader className="p-2">
            <CardTitle className="flex items-center gap-2"><Trophy className="text-amber-500" /> Busiest Day</CardTitle>
            <CardDescription className="mt-1">Your personal record for the most completed trips in a single day.</CardDescription>
          </CardHeader>
          <div className="p-2 flex items-baseline gap-3">
            <div className="text-4xl font-bold text-primary">{mostTripsInADay.count}</div>
            <div className="text-sm text-muted-foreground"><p className="font-semibold text-card-foreground">Trips</p>on {formattedDate}</div>
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
          <DialogTitle>Busiest Day Details</DialogTitle>
          <DialogDescription>
            A deep dive into your most active day: {mostTripsInADay.count} trips on {formattedDate}.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4">
          <BusiestDayStats trips={mostTripsInADay.trips} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
          <div className="relative overflow-auto h-[400px] lg:h-auto border rounded-lg">
            {mostTripsInADay.trips.map((trip, index) => (
              <div
                key={trip.trip_uuid || index}
                className={cn(
                  "p-3 border-b last:border-b-0 bg-card hover:bg-muted/50 transition-colors cursor-pointer",
                  selectedTrip?.trip_uuid === trip.trip_uuid && "bg-primary/10"
                )}
                onClick={() => setSelectedTrip(trip)}
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
              rows={mostTripsInADay.trips}
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

export default MostTripsInADay;