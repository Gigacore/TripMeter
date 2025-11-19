import React from 'react';
import { CSVRow } from '../../services/csvParser';
import { formatCurrency } from '../../utils/currency';
import { toNumber } from '../../utils/formatters';
import { X, MapPin, Calendar, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TripListProps {
  list: CSVRow[];
  title: string;
  onBack: () => void;
  onFocusOnTrip: (trip: CSVRow) => void;
  focusedTrip?: CSVRow | null;
  renderTripStat?: (trip: CSVRow) => React.ReactNode;
}

const TripList: React.FC<TripListProps> = ({ list, title, onBack, onFocusOnTrip, focusedTrip, renderTripStat }) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-4 border-b flex items-center gap-3 sticky top-0 bg-background z-10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X size={20} className="text-muted-foreground" />
        </button>
        <div>
          <h3 className="font-semibold text-lg leading-none">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{list.length} {list.length === 1 ? 'trip' : 'trips'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
        {list.map((trip, index) => {
          const isSelected = focusedTrip === trip;
          return (
            <div
              key={index}
              onClick={() => onFocusOnTrip(trip)}
              className={cn(
                "group relative flex flex-col gap-3 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md",
                isSelected
                  ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary"
                  : "bg-card border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs">
                    <Calendar size={12} />
                    {formatDate(trip.begin_trip_time || trip.request_time)}
                  </span>
                  <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs">
                    <Clock size={12} />
                    {formatTime(trip.begin_trip_time || trip.request_time)}
                  </span>
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                  trip.status?.toLowerCase() === 'completed' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    trip.status?.toLowerCase().includes('cancel') ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                )}>
                  {trip.status || 'N/A'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="mt-1 flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div className="w-0.5 h-8 bg-border border-l border-dashed" />
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                  </div>
                  <div className="flex-1 space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Pickup</p>
                      <p className="font-medium leading-tight line-clamp-2" title={trip.begintrip_address}>
                        {trip.begintrip_address || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Dropoff</p>
                      <p className="font-medium leading-tight line-clamp-2" title={trip.dropoff_address}>
                        {trip.dropoff_address || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-1 border-t flex items-center justify-between text-sm">
                <div className="font-semibold flex items-center gap-1 text-foreground">
                  <DollarSign size={14} className="text-muted-foreground" />
                  {formatCurrency(toNumber(trip.fare_amount), trip.fare_currency)}
                </div>
                {renderTripStat ? (
                  renderTripStat(trip)
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {trip.product_type}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TripList;