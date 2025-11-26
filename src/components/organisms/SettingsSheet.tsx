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
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../molecules/LanguageSwitcher';

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
  const { t } = useTranslation();

  return (
    <Sheet open={isMenuOpen} onOpenChange={toggleMenu}>
      <SheetContent className="w-full sm:w-[540px] p-6 bg-card text-card-foreground">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-2xl font-bold">{t('settings')}</SheetTitle>
          <SheetDescription>
            {t('settingsDescription')}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('display')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme-selector" className="flex items-center gap-2">
                  <Sun className="h-5 w-5" /> {t('theme')}
                </Label>
                <div id="theme-selector" className="flex items-center gap-2 rounded-lg p-1">
                  <Button variant={theme === 'light' ? 'default' : 'ghost'} size="sm" onClick={() => setTheme('light')}>{t('light')}</Button>
                  <Button variant={theme === 'dark' ? 'default' : 'ghost'} size="sm" onClick={() => setTheme('dark')}>{t('dark')}</Button>
                  <Button variant={theme === 'system' ? 'default' : 'ghost'} size="sm" onClick={() => setTheme('system')}>{t('system')}</Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="distance-unit" className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" /> {t('distanceUnit')}
                </Label>
                <RadioGroup
                  id="distance-unit"
                  defaultValue={unit}
                  onValueChange={(value: DistanceUnit) => setUnit(value)}
                  className="flex items-center gap-4"
                >
                  <Label htmlFor="miles" className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="miles" id="miles" />
                    {t('miles')}
                  </Label>
                  <Label htmlFor="km" className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="km" id="km" />
                    {t('kilometers')}
                  </Label>
                </RadioGroup>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="language-switcher" className="flex items-center gap-2">
                  <Landmark className="h-5 w-5" /> {t('language')}
                </Label>
                <LanguageSwitcher />
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
