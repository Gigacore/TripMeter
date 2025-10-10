import React, { useEffect, useRef } from 'react';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet.heat';
import 'leaflet-fullscreen';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import { greenIcon, redIcon, blueIcon } from '../../constants';
import { formatCurrency } from '../../utils/currency';
import { toNumber } from '../../utils/formatters';
import { CSVRow } from '../../services/csvParser';
import { DistanceUnit } from '../../App';

let mapIdCounter = 0;

interface Location {
  lat: number;
  lng: number;
  count: number;
  commonAddress: string;
  type?: 'pickup' | 'dropoff';
}
interface MapProps {
    rows: CSVRow[];
    focusedTrip: CSVRow | null;
    layout?: any;
    distanceUnit: DistanceUnit;
    convertDistance: (miles: number) => number;
    locations: Location[];
    selectedLocation?: Location | null;
}

const Map: React.FC<MapProps> = ({ rows, focusedTrip, layout, distanceUnit, convertDistance, locations }) => {
    const mapRef = useRef<L.Map | null>(null);
    const beginLayerRef = useRef<L.FeatureGroup | null>(null);
    const dropLayerRef = useRef<L.FeatureGroup | null>(null);
    const mapIdRef = useRef(`map-${mapIdCounter++}`);
    const heatLayerRef = useRef<any>(null); // Using any because leaflet.heat types are not available

    const fitToLayers = () => {
        if (mapRef.current) {
            const layers = [beginLayerRef.current, dropLayerRef.current].filter(Boolean) as L.FeatureGroup[];
            const group = L.featureGroup(layers);
            if (group && group.getLayers().length > 0) {
                try {
                    const b = group.getBounds();
                    if (b.isValid()) {
                        mapRef.current.fitBounds(b.pad(0.1));
                    }
                } catch (e) {
                    console.error("Could not fit bounds", e);
                }
            }
        }
    };

    useEffect(() => {
        if ((rows.length > 0 || (locations && locations.length > 0)) && !mapRef.current) {
            const map = L.map(mapIdRef.current);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            mapRef.current = map;
            beginLayerRef.current = L.featureGroup().addTo(map);
            dropLayerRef.current = L.featureGroup().addTo(map);
            heatLayerRef.current = (L as any).heatLayer([], { radius: 25 }).addTo(map);

            L.control.layers(null, {
                'Begintrip (green)': beginLayerRef.current,
                'Dropoff (red)': dropLayerRef.current,
                'Heatmap': heatLayerRef.current
            }).addTo(map);

            // Add fullscreen control
            (L.control as any).fullscreen().addTo(map);
        }
    }, [rows, locations]);

    useEffect(() => {
        if (mapRef.current) {
            const timer = setTimeout(() => {
                mapRef.current?.invalidateSize({ pan: false });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [layout]);

    useEffect(() => {
        if (!mapRef.current) return;

        beginLayerRef.current?.clearLayers();
        dropLayerRef.current?.clearLayers();
        heatLayerRef.current?.setLatLngs([]);

        const heatPoints: LatLngExpression[] = [];
        const tripsToRender = focusedTrip
            ? [focusedTrip]
            : rows.filter(r =>
                r.status?.toLowerCase() === 'completed'
            );

        const createPopupContent = (pointType: 'begin' | 'drop', data: CSVRow): string => {
            const {
                city, product_type, status, request_time, begin_trip_time,
                begintrip_address, dropoff_time, dropoff_address, distance,
                fare_amount, fare_currency, begintrip_lat, begintrip_lng,
                dropoff_lat, dropoff_lng
            } = data;

            const lat = pointType === 'begin' ? begintrip_lat : dropoff_lat;
            const lng = pointType === 'begin' ? begintrip_lng : dropoff_lng;
            const address = pointType === 'begin' ? begintrip_address : dropoff_address;
            let speedContent = '';
            let waitingTimeContent = '';

            const tripDistanceMiles = parseFloat(distance);
            const displayDistance = convertDistance(tripDistanceMiles);

            if (status === 'completed') {
                const reqTime = new Date(request_time);
                const bTime = new Date(begin_trip_time);
                if (bTime.getTime() && reqTime.getTime() && bTime > reqTime) {
                    const waitingMinutes = (bTime.getTime() - reqTime.getTime()) / (1000 * 60);
                    waitingTimeContent = `<b>Waiting Time:</b> ${waitingMinutes.toFixed(2)} minutes<br>`;
                }
                const dTime = new Date(dropoff_time);

                if (!isNaN(tripDistanceMiles) && bTime.getTime() && dTime.getTime() && dTime > bTime) {
                    const durationHours = (dTime.getTime() - bTime.getTime()) / (1000 * 60 * 60);
                    if (durationHours > 0) {
                        const speed = displayDistance / durationHours;
                        speedContent = `<b>Average Speed:</b> ${speed.toFixed(2)} ${distanceUnit === 'miles' ? 'mph' : 'km/h'}<br>`;
                    }
                }
            }

            return `
                <b>${pointType === 'begin' ? 'Begin Trip' : 'Dropoff'} Details</b><br>
                <b>City:</b> ${city || 'N/A'}<br>
                <b>Product Type:</b> ${product_type || 'N/A'}<br>
                <b>Status:</b> ${status || 'N/A'}<br>
                <b>Request Time:</b> ${request_time || 'N/A'}<br>
                <b>Begin Trip Time:</b> ${begin_trip_time || 'N/A'}<br>
                ${waitingTimeContent}
                <b>Dropoff Time:</b> ${dropoff_time || 'N/A'}<br>
                <b>Address:</b> ${address || 'N/A'}<br>
                <b>Distance:</b> ${!isNaN(displayDistance) ? `${displayDistance.toFixed(2)} ${distanceUnit}` : 'N/A'}<br>
                ${speedContent}
                <b>Fare:</b> ${formatCurrency(toNumber(fare_amount), fare_currency)}<br>
                <b>Coordinates:</b> ${lat}, ${lng}<br>
            `;
        };

        tripsToRender.forEach((r: CSVRow) => {
            const blt = toNumber(r.begintrip_lat);
            const bln = toNumber(r.begintrip_lng);
            const dlt = toNumber(r.dropoff_lat);
            const dln = toNumber(r.dropoff_lng);

            if (blt != null && bln != null && dlt != null && dln != null) {
                heatPoints.push([blt, bln]);
                heatPoints.push([dlt, dln]);

                const m = L.marker([blt, bln], { icon: greenIcon });
                m.bindPopup(createPopupContent('begin', r));
                beginLayerRef.current?.addLayer(m);

                const m2 = L.marker([dlt, dln], { icon: redIcon });
                m2.bindPopup(createPopupContent('drop', r));
                dropLayerRef.current?.addLayer(m2);
            }
        });

        heatLayerRef.current?.setLatLngs(heatPoints);

        if (locations) {
            locations.forEach(loc => {
                const icon = loc.type === 'pickup' ? greenIcon : loc.type === 'dropoff' ? redIcon : blueIcon;
                const marker = L.marker([loc.lat, loc.lng], { icon });
                marker.bindPopup(`
                    <b>Location Hotspot</b><br>
                    <b>Trip Count:</b> ${loc.count}<br>
                    <b>Common Address:</b> ${loc.commonAddress || 'N/A'}<br>
                    <b>Coordinates:</b> ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}
                `);
                beginLayerRef.current?.addLayer(marker);
            });
        }

        if ((rows.length > 0 || (locations && locations.length > 0)) && !focusedTrip) {
            fitToLayers();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows, focusedTrip, convertDistance, distanceUnit, locations]);

    return (
    <div className="flex-shrink-0 map-hero">
            <main id={mapIdRef.current} style={{ width: '100%', height: '100%' }}></main>
        </div>
    );
};

export default Map;
