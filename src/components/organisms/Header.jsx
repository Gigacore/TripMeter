import React from 'react';

const Header = ({ distanceUnit, onDistanceUnitChange, onReset, actionsEnabled, error }) => {
  return (
    <header>
      <h1 className="text-3xl font-bold underline">CSV → Map & KML</h1>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
        {actionsEnabled && (
          <button onClick={onReset} disabled={!actionsEnabled && !error}>Clear</button>
        )}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="hint">Unit:</span>
        <button className={distanceUnit === 'miles' ? 'primary' : ''} onClick={() => onDistanceUnitChange('miles')}>Miles</button>
        <button className={distanceUnit === 'km' ? 'primary' : ''} onClick={() => onDistanceUnitChange('km')}>Kilometers</button>
      </div>
    </header>
  );
};

export default Header;
