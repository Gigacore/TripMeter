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

interface SettingsSheetProps {
  unit: DistanceUnit;
  setUnit: (unit: DistanceUnit) => void;
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const SettingsSheet: React.FC<SettingsSheetProps> = ({ unit, setUnit, isMenuOpen, toggleMenu }) => {
  return (
    <Sheet open={isMenuOpen} onOpenChange={toggleMenu}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Adjust your preferences for the application.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label id="distance-unit-label" className="text-right">
              Distance Unit
            </Label>
            <RadioGroup
              defaultValue={unit}
              onValueChange={(value: DistanceUnit) => setUnit(value)}
              className="col-span-3 flex items-center space-x-2"
              role="radiogroup"
              aria-labelledby="distance-unit-label"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="miles" id="miles" />
                <Label htmlFor="miles">Miles</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="km" id="km" />
                <Label htmlFor="km">Kilometers</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;