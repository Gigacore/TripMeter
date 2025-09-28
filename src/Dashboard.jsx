import React from 'react';
import Map from '/src/components/Map';
import Stats from '/src/components/Stats';

function Dashboard() {
  return (
    <div className="dashboard">
      <header>
        <h1>Dashboard</h1>
      </header>
      <section className="stats-section">
        <h2>High-Level Stats</h2>
        <Stats />
      </section>
      <section className="map-hero">
        <Map />
      </section>
    </div>
  );
}

export default Dashboard;