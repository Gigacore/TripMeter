import React from 'react';
import Map from '@/components/organisms/Map';
import SimpleStats from '@/components/molecules/SimpleStats';

function Dashboard() {
  return (
    <div className="dashboard">
      <header>
        <h1>Dashboard</h1>
      </header>
  <section className="mb-6">
        <h2>High-Level Stats</h2>
        <SimpleStats />
      </section>
  <section className="mb-6 map-hero">
        <Map />
      </section>
    </div>
  );
}

export default Dashboard;