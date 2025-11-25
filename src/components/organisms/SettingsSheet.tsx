import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DistanceUnit } from '../../App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Landmark, Moon, Sun, Ruler } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

interface SettingsSheetProps {
  unit: DistanceUnit;
  setUnit: (unit: DistanceUnit) => void;
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const SettingsSheet: React.FC<SettingsSheetProps> = ({
  unit,
  setUnit,
  isMenuOpen,
  toggleMenu,
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <Sheet open={isMenuOpen} onOpenChange={toggleMenu}>
      <SheetContent className="w-full sm:w-[540px] p-6 bg-card text-card-foreground">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-2xl font-bold">Settings</SheetTitle>
          <SheetDescription>
            Customize your experience.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme-selector" className="flex items-center gap-2">
                  <Sun className="h-5 w-5" /> Theme
                </Label>
                <div id="theme-selector" className="flex items-center gap-2 rounded-lg p-1">
                  <Button variant={theme === 'light' ? 'default' : 'ghost'} size="sm" onClick={() => setTheme('light')}>Light</Button>
                  <Button variant={theme === 'dark' ? 'default' : 'ghost'} size="sm" onClick={() => setTheme('dark')}>Dark</Button>
                  <Button variant={theme === 'system' ? 'default' : 'ghost'} size="sm" onClick={() => setTheme('system')}>System</Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="distance-unit" className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" /> Distance Unit
                </Label>
                <RadioGroup
                  id="distance-unit"
                  defaultValue={unit}
                  onValueChange={(value: DistanceUnit) => setUnit(value)}
                  className="flex items-center gap-4"
                >
                  <Label htmlFor="miles" className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="miles" id="miles" />
                    Miles
                  </Label>
                  <Label htmlFor="km" className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="km" id="km" />
                    Kilometers
                  </Label>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
