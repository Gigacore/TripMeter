import React from 'react';
import SettingsIcon from '../atoms/SettingsIcon';

const Header = ({ onReset, actionsEnabled, error, toggleSettings }) => {
  return (
    <header>
      <h1 className="text-3xl font-bold underline">CSV → Map & KML</h1>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
        {actionsEnabled && (
          <button onClick={onReset} disabled={!actionsEnabled && !error}>Clear</button>
        )}
        <SettingsIcon onClick={toggleSettings} />
      </div>
    </header>
  );
};

export default Header;
