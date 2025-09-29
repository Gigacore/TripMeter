import React from 'react';
import Stats from './Stats';
import TripList from './TripList';
import FocusedTripInfo from '../molecules/FocusedTripInfo';

const Sidebar = ({
  layout,
  focusedTrip,
  onShowAll,
  convertDistance,
  distanceUnit,
  sidebarView,
  error,
  tripData,
  onFocusOnTrip,
  onShowTripList,
  onFileSelect,
  isProcessing,
  rows,
  tripList,
  tripListTitle,
  onBackToStats,
}) => {
  return (
    <aside
      className={`bg-slate-900 border-t border-gray-800 p-4${layout === 'split' ? ' flex-[0_0_70%]' : ''}`}
    >
      {focusedTrip && (
        <FocusedTripInfo
          trip={focusedTrip}
          onShowAll={onShowAll}
          distanceUnit={distanceUnit}
          convertDistance={convertDistance}
        />
      )}
      {sidebarView === 'stats' && (
        <>
          {error && (
            <div className="mb-6 error">
              {error}
            </div>
          )}
          <Stats
            data={tripData}
            onFocusOnTrip={onFocusOnTrip}
            onShowTripList={onShowTripList}
            distanceUnit={distanceUnit}
            onFileSelect={onFileSelect}
            isProcessing={isProcessing}
            rows={rows}
          />
        </>
      )}
      {sidebarView === 'tripList' && (
        <TripList
          list={tripList}
          title={tripListTitle}
          onBack={onBackToStats}
          onFocusOnTrip={onFocusOnTrip}
        />
      )}
    </aside>
  );
};

export default Sidebar;