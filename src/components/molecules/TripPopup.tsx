import React from 'react';
import { CSVRow } from '../../services/csvParser';
import { formatCurrency } from '../../utils/currency';
import { toNumber } from '../../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Clock, Navigation, DollarSign, Calendar, Activity } from 'lucide-react';

interface TripPopupProps {
    data: CSVRow;
    pointType: 'begin' | 'drop';
    distanceUnit: 'miles' | 'km';
    convertDistance: (miles: number) => number;
}

const TripPopup: React.FC<TripPopupProps> = ({ data, pointType, distanceUnit, convertDistance }) => {
    const {
        city, product_type, status, request_time, begin_trip_time,
        begintrip_address, dropoff_time, dropoff_address, distance,
        fare_amount, fare_currency
    } = data;

    const isBegin = pointType === 'begin';
    const address = isBegin ? begintrip_address : dropoff_address;
    const title = isBegin ? 'Pickup Location' : 'Dropoff Location';

    const tripDistanceMiles = parseFloat(distance);
    const displayDistance = convertDistance(tripDistanceMiles);

    // Calculate durations
    let waitTime = '';
    let avgSpeed = '';

    if (status === 'completed') {
        const reqTime = new Date(request_time);
        const bTime = new Date(begin_trip_time);
        if (bTime.getTime() && reqTime.getTime() && bTime > reqTime) {
            const waitingMinutes = (bTime.getTime() - reqTime.getTime()) / (1000 * 60);
            waitTime = `${waitingMinutes.toFixed(1)} min`;
        }

        const dTime = new Date(dropoff_time);
        if (!isNaN(tripDistanceMiles) && bTime.getTime() && dTime.getTime() && dTime > bTime) {
            const durationHours = (dTime.getTime() - bTime.getTime()) / (1000 * 60 * 60);
            if (durationHours > 0) {
                const speed = displayDistance / durationHours;
                avgSpeed = `${speed.toFixed(1)} ${distanceUnit === 'miles' ? 'mph' : 'km/h'}`;
            }
        }
    }

    return (
        <Card className="w-[280px] border-0 shadow-none bg-white text-gray-950 p-3">
            <CardHeader className="p-0 pb-2 space-y-0.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-950" />
                        <CardTitle className="text-sm font-bold text-gray-950">{title}</CardTitle>
                    </div>
                    <Badge variant="outline" className="capitalize text-xs text-gray-500 border-gray-200 bg-white px-1.5 py-0">
                        {status}
                    </Badge>
                </div>
                <p className="text-xs text-gray-500 font-medium line-clamp-1">{address}</p>
            </CardHeader>

            <CardContent className="p-0 grid gap-2">
                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-100 p-1.5 rounded space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <DollarSign className="w-3 h-3" />
                            <span>Fare</span>
                        </div>
                        <p className="font-semibold text-xs text-gray-950">{formatCurrency(toNumber(fare_amount), fare_currency)}</p>
                    </div>
                    <div className="bg-gray-100 p-1.5 rounded space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <Navigation className="w-3 h-3" />
                            <span>Distance</span>
                        </div>
                        <p className="font-semibold text-xs text-gray-950">
                            {!isNaN(displayDistance) ? `${displayDistance.toFixed(1)} ${distanceUnit}` : 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Time Details */}
                <div className="space-y-1.5 text-xs border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>Request</span>
                        </div>
                        <span className="font-medium text-gray-950">{new Date(request_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {waitTime && (
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1 text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>Wait Time</span>
                            </div>
                            <span className="font-medium text-gray-950">{waitTime}</span>
                        </div>
                    )}

                    {avgSpeed && (
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1 text-gray-500">
                                <Activity className="w-3 h-3" />
                                <span>Avg Speed</span>
                            </div>
                            <span className="font-medium text-gray-950">{avgSpeed}</span>
                        </div>
                    )}
                </div>

                <div className="pt-1.5 flex items-center gap-1.5 text-[10px] text-gray-500 border-t border-gray-200 mt-1">
                    <span className="font-semibold text-gray-950">{city}</span>
                    <span>•</span>
                    <span>{product_type}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default TripPopup;
