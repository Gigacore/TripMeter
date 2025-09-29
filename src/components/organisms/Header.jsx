import React from 'react';
import SettingsIcon from '../atoms/SettingsIcon';

const Header = ({ onReset, actionsEnabled, error, toggleSettings }) => {
  return (
    <header className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-800 bg-slate-900 text-slate-50">
      <h1 className="text-lg font-bold mr-2">CSV → Map & KML</h1>
      <div className="flex items-center gap-4 ml-auto">
        {actionsEnabled && (
          <button onClick={onReset} disabled={!actionsEnabled && !error} className="px-2 py-1 rounded bg-slate-800 text-slate-100 hover:bg-slate-700">Clear</button>
        )}
        <SettingsIcon onClick={toggleSettings} />
      </div>
    </header>
  );
};

export default Header;
