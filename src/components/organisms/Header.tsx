import { ModeToggle } from '../molecules/ModeToggle';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Settings, Trash2, Download, Github, Route } from 'lucide-react';
import { downloadKML } from '@/services/kmlService';
import { CSVRow } from '@/services/csvParser';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


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
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center">
          <div className="mr-4 flex">
            <a href="/" className="mr-6 flex items-center space-x-2">
              <Route className="h-6 w-6 text-primary" />
              <span className="font-bold">TripMeter</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            {actionsEnabled && (
              <>
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Download KML</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleDownloadKML('both')}>Download KML (Combined)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownloadKML('begin')}>Download KML (Pickups)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownloadKML('drop')}>Download KML (Dropoffs)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onReset}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Clear Data</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear Data</TooltipContent>
                </Tooltip>
              </>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleSettings}>
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
            <ModeToggle />
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default Header;
