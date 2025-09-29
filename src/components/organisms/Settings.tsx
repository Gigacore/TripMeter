import React from 'react';
import { DistanceUnit } from '../../App';

interface SettingsProps {
  unit: DistanceUnit;
  setUnit: (unit: DistanceUnit) => void;
  downloadKml: () => void;
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  unit,
  setUnit,
  downloadKml,
  isMenuOpen,
  toggleMenu,
}) => {
  if (!isMenuOpen) {
    return null;
  }

  return (
    <div className="absolute top-16 right-4 bg-white p-4 rounded-md shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Settings</h2>
      <div className="flex items-center justify-between mb-4">
        <span>Unit</span>
        <div className="flex items-center">
          <button
            onClick={() => setUnit('km')}
            className={`px-2 py-1 rounded-l-md ${
              unit === 'km' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            KM
          </button>
          <button
            onClick={() => setUnit('miles')}
            className={`px-2 py-1 rounded-r-md ${
              unit === 'miles' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Miles
          </button>
        </div>
      </div>
      <button
        onClick={downloadKml}
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
      >
        Download KML
      </button>
      <button
        onClick={toggleMenu}
        className="w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 mt-2"
      >
        Close
      </button>
    </div>
  );
};

export default Settings;
