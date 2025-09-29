import L from 'leaflet';

export const greenIcon = L.icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -28]
});

export const redIcon = L.icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -28]
});

export const KM_PER_MILE = 1.60934;