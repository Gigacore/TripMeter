import React from 'react';
import TripList from './TripList';
import FocusedTripInfo from '../molecules/FocusedTripInfo';
import { CSVRow } from '../../services/csvParser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SidebarProps {
  layout?: any;
  focusedTrip: CSVRow | null;
  onShowAll: () => void;
  sidebarView: 'stats' | 'tripList';
  onFocusOnTrip: (tripRow: CSVRow) => void;
  onShowTripList: (type: string) => void;
  tripList: CSVRow[];
  tripListTitle: string;
  onBackToStats: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  layout,
  focusedTrip,
  onShowAll,
  sidebarView,
  onFocusOnTrip,
  onShowTripList,
  tripList,
  tripListTitle,
  onBackToStats,
}) => {
  return (
    <aside
      // className={`bg-slate-900 border-t border-gray-800 p-4${layout === 'split' ? ' flex-[0_0_70%]' : ''}`}
      className={`p-4${layout === 'split' ? ' flex-[0_0_70%]' : ''}`}
    >
      {focusedTrip && (
        <FocusedTripInfo
          trip={focusedTrip}
          onShowAll={onShowAll}
        />
      )}
      <Tabs value={sidebarView} onValueChange={(value) => value === 'stats' ? onBackToStats() : onShowTripList('all')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="tripList">Trip List</TabsTrigger>
        </TabsList>
        <TabsContent value="stats" />
        <TabsContent value="tripList">
          <TripList
            list={tripList}
            title={tripListTitle}
            onBack={onBackToStats}
            onFocusOnTrip={onFocusOnTrip}
          />
        </TabsContent>
      </Tabs>
    </aside>
  );
};

export default Sidebar;