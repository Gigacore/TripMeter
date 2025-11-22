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
import { renderToString } from 'react-dom/server';
import TripPopup from '../molecules/TripPopup';

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
            heatLayerRef.current = (L as any).heatLayer([], { radius: 25 });

            L.control.layers(undefined, {
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
            return renderToString(
                <TripPopup
                    data={data}
                    pointType={pointType}
                    distanceUnit={distanceUnit}
                    convertDistance={convertDistance}
                />
            );
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
                m.bindPopup(createPopupContent('begin', r), {
                    className: 'trip-popup-no-hover',
                    offset: [0, -10],
                    autoPan: true,
                    closeButton: true,
                    autoClose: false,
                    closeOnClick: false
                });
                beginLayerRef.current?.addLayer(m);

                const m2 = L.marker([dlt, dln], { icon: redIcon });
                m2.bindPopup(createPopupContent('drop', r), {
                    className: 'trip-popup-no-hover',
                    offset: [0, -10],
                    autoPan: true,
                    closeButton: true,
                    autoClose: false,
                    closeOnClick: false
                });
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

        if (rows.length > 0 || (locations && locations.length > 0)) {
            fitToLayers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows, focusedTrip, convertDistance, distanceUnit, locations]);

    return (
        <div role="application" aria-label="Map of trips" className="flex-shrink-0 map-hero rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div id={mapIdRef.current} style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
};

export default Map;
