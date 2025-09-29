import React from 'react';

function RidesList() {
  // Placeholder data
  const rides = [
    { id: 1, name: 'Morning Ride' },
    { id: 2, name: 'Afternoon Commute' },
    { id: 3, name: 'Weekend Trip' },
  ];

  return (
    <div>
      <h2>Rides</h2>
      <ul>{rides.map(ride => <li key={ride.id}>{ride.name}</li>)}</ul>
    </div>
  );
}

export default RidesList;