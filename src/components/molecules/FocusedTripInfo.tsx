import React from 'react';
import { CSVRow } from '../../services/csvParser';

interface FocusedTripInfoProps {
  trip: CSVRow;
  onShowAll: () => void;
}

const FocusedTripInfo: React.FC<FocusedTripInfoProps> = ({ trip, onShowAll }) => {
  return (
  <div className="mb-6 focused-trip-info">
      <div className="trip-list-header flex items-center">
        <h3>Focused Trip</h3>
        <button onClick={onShowAll} className="ml-auto">Show All</button>
      </div>
      <p>
        <strong>Status:</strong> <span className={`status-pill ${trip.status?.toLowerCase()}`}>{trip.status || 'N/A'}</span><br />
        <strong>From:</strong> {trip.begintrip_address || 'N/A'}<br />
        <strong>To:</strong> {trip.dropoff_address || 'N/A'}<br />
        <strong>Distance:</strong> {trip.distance}
      </p>
    </div>
  );
};

export default FocusedTripInfo;