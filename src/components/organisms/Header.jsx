import React from 'react';
import SettingsIcon from '../atoms/SettingsIcon';

const Header = ({ onReset, actionsEnabled, error, toggleSettings }) => {
  return (
    <header className="flex items-center">
      <h1 className="text-3xl font-bold underline">CSV → Map & KML</h1>
      <div className="ml-auto flex items-center gap-4">
        {actionsEnabled && (
          <button onClick={onReset} disabled={!actionsEnabled && !error}>Clear</button>
        )}
        <SettingsIcon onClick={toggleSettings} />
      </div>
    </header>
  );
};

export default Header;
