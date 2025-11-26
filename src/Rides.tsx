import React from 'react';
import RidesList from '@/components/molecules/RidesList';
import Map from '@/components/organisms/Map';

function Rides() {
  return (
    <div className="flex h-screen">
      <aside className="w-[300px] overflow-y-auto border-r border-gray-300">
        <RidesList />
      </aside>
      <main className="flex-1">
        <Map />
      </main>
    </div>
  );
}

export default Rides;