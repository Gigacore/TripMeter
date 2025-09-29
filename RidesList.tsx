import React from 'react';

interface Ride {
  id: number;
  name: string;
}

const RidesList: React.FC = () => {
  // Placeholder data
  const rides: Ride[] = [
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