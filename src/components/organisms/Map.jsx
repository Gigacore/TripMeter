import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { greenIcon, redIcon } from '../../constants';
import { toNumber } from '../../utils/formatters';

const Map = ({ rows, focusedTrip, layout, distanceUnit, convertDistance }) => {
    const mapRef = useRef(null);
    const beginLayerRef = useRef(null);
    const dropLayerRef = useRef(null);
    const heatLayerRef = useRef(null);

    const fitToLayers = () => {
        if (mapRef.current && beginLayerRef.current && dropLayerRef.current) {
            const group = L.featureGroup([beginLayerRef.current, dropLayerRef.current]);
            if (group.getLayers().length > 0) {
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
        if (rows.length > 0 && !mapRef.current) {
            const map = L.map('map');
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            mapRef.current = map;
            beginLayerRef.current = L.featureGroup().addTo(map);
            dropLayerRef.current = L.featureGroup().addTo(map);
            heatLayerRef.current = L.heatLayer([], { radius: 25 }).addTo(map);

            L.control.layers(null, {
                'Begintrip (green)': beginLayerRef.current,
                'Dropoff (red)': dropLayerRef.current,
                'Heatmap': heatLayerRef.current
            }).addTo(map);

        }
    }, [rows]);

    useEffect(() => {
        if (mapRef.current) {
            const timer = setTimeout(() => {
                mapRef.current.invalidateSize({ pan: false });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [layout]);

    useEffect(() => {
        if (!mapRef.current) return;

        beginLayerRef.current?.clearLayers();
        dropLayerRef.current?.clearLayers();
        heatLayerRef.current?.setLatLngs([]);

        const heatPoints = [];
        const tripsToRender = focusedTrip ? [focusedTrip] : rows;

        const createPopupContent = (pointType, data) => {
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
                const requestTime = new Date(request_time);
                const beginTime = new Date(begin_trip_time);
                if (beginTime.getTime() && requestTime.getTime() && beginTime > requestTime) {
                    const waitingMinutes = (beginTime - requestTime) / (1000 * 60);
                    waitingTimeContent = `<b>Waiting Time:</b> ${waitingMinutes.toFixed(2)} minutes<br>`;
                }
                const dropoffTime = new Date(dropoff_time);

                if (!isNaN(tripDistanceMiles) && beginTime.getTime() && dropoffTime.getTime() && dropoffTime > beginTime) {
                    const durationHours = (dropoffTime - beginTime) / (1000 * 60 * 60);
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
                <b>Fare:</b> ${fare_amount || 'N/A'} ${fare_currency || ''}<br>
                <b>Coordinates:</b> ${lat}, ${lng}<br>
            `;
        };

        tripsToRender.forEach((r) => {
            const blt = toNumber(r.begintrip_lat);
            const bln = toNumber(r.begintrip_lng);
            const dlt = toNumber(r.dropoff_lat);
            const dln = toNumber(r.dropoff_lng);

            if (blt != null && bln != null) {
                heatPoints.push([blt, bln]);
                const m = L.marker([blt, bln], { icon: greenIcon });
                m.bindPopup(createPopupContent('begin', r));
                beginLayerRef.current.addLayer(m);

                if (dlt != null && dln != null) {
                    heatPoints.push([dlt, dln]);
                    const m = L.marker([dlt, dln], { icon: redIcon });
                    m.bindPopup(createPopupContent('drop', r));
                    dropLayerRef.current.addLayer(m);
                }
            }
        });

        heatLayerRef.current.setLatLngs(heatPoints);

        if (rows.length > 0 && !focusedTrip) {
            fitToLayers();
        }
    }, [rows, focusedTrip, convertDistance, distanceUnit]);

    return (
        <div className="map-container map-hero">
            <main id="map"></main>
        </div>
    );
};

export default Map;
