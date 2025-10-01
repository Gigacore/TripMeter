import { ModeToggle } from '../molecules/ModeToggle';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Settings, Trash2, Download } from 'lucide-react';
import { downloadKML } from '@/services/kmlService';
import { CSVRow } from '@/services/csvParser';

interface HeaderProps {
  onReset: () => void;
  actionsEnabled: boolean;
  error: string;
  toggleSettings: () => void;
  rows: CSVRow[];
}

const Header: React.FC<HeaderProps> = ({ onReset, actionsEnabled, error, toggleSettings, rows }) => {
  const handleDownloadKML = (which: 'both' | 'begin' | 'drop') => {
    downloadKML(rows, which);
  };

  return (
    <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-slate-800 bg-slate-900/80 text-slate-50 backdrop-blur-sm sticky top-0 z-40">
      <h1 className="text-lg font-bold">Trip Visualizer</h1>
      <div className="flex items-center gap-2 ml-auto">
        {actionsEnabled && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleDownloadKML('both')}>Download KML (Combined)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadKML('begin')}>Download KML (Pickups)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadKML('drop')}>Download KML (Dropoffs)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Clear Data</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onReset}>Clear Data</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSettings}>
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
        <ModeToggle />
      </div>
    </header>
  );
};

export default Header;
