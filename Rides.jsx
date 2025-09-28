import React from 'react';
import RidesList from '../components/RidesList';
import Map from '../components/Map';

function Rides() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: '300px', overflowY: 'auto', borderRight: '1px solid #ccc' }}>
        <RidesList />
      </aside>
      <main style={{ flex: 1 }}>
        <Map />
      </main>
    </div>
  );
}

export default Rides;