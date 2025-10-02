import React from 'react';
import { CityStat } from '@/hooks/useTripData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CityStatsTableProps {
  cityStats: CityStat[];
}

const CityStatsTable: React.FC<CityStatsTableProps> = ({ cityStats }) => {
  if (cityStats.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fare Analysis by City</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  City
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Trip Count
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Avg Fare / Distance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cityStats.map(stat => (
                <tr key={`${stat.city}-${stat.currency}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stat.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.tripCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.avgFarePerDistance.toFixed(2)} ({stat.currency})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CityStatsTable;