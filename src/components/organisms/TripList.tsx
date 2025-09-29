import React from 'react';
import { CSVRow } from '../../services/csvParser';

interface TripListProps {
  list: CSVRow[];
  title: string;
  onBack: () => void;
  onFocusOnTrip: (trip: CSVRow) => void;
}

const TripList: React.FC<TripListProps> = ({ list, title, onBack, onFocusOnTrip }) => {
  return (
  <div className="mb-6">
      <div className="trip-list-header">
        <button onClick={onBack}>← Back</button>
        <h3>{title}</h3>
      </div>
      <ul className="trip-list">
        {list.map((trip, index) => (
          <li key={index} onClick={() => onFocusOnTrip(trip)}>
            <div className="trip-list-item-header">
              <strong>Trip #{index + 1}</strong>
              <span className={`status-pill ${trip.status?.toLowerCase()}`}>{trip.status || 'N/A'}</span>
            </div>
            <div className="trip-list-item-body">
              From: {trip.begintrip_address || 'N/A'}<br/>
              To: {trip.dropoff_address || 'N/A'}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TripList;