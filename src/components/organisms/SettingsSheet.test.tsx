import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SettingsSheet from './SettingsSheet';
import { DistanceUnit } from '../../App';

vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open, onOpenChange }: { children: React.ReactNode, open: boolean, onOpenChange: () => void }) => (
    <div data-testid="sheet" data-open={open} onClick={onOpenChange}>{children}</div>
  ),
  SheetContent: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-content">{children}</div>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-header">{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  SheetDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode, htmlFor: string }) => <label htmlFor={htmlFor}>{children}</label>,
}));

vi.mock('@/components/ui/radio-group', () => ({
  RadioGroup: ({ children, onValueChange, defaultValue }: { children: React.ReactNode, onValueChange: (value: string) => void, defaultValue: string }) => (
    <div data-testid="radio-group" onClick={() => onValueChange(defaultValue === 'miles' ? 'km' : 'miles')}>{children}</div>
  ),
  RadioGroupItem: ({ value, id }: { value: string, id: string }) => <input type="radio" name="distance-unit" value={value} id={id} />,
}));

const mockProps = {
  unit: 'miles' as DistanceUnit,
  setUnit: vi.fn(),
  isMenuOpen: true,
  toggleMenu: vi.fn(),
};

describe('SettingsSheet', () => {
  it('should render the settings title and description', () => {
    render(<SettingsSheet {...mockProps} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Adjust your preferences for the application.')).toBeInTheDocument();
  });

  it('should pass the open and toggleMenu props to the Sheet component', async () => {
    const user = userEvent.setup();
    render(<SettingsSheet {...mockProps} />);
    const sheet = screen.getByTestId('sheet');
    expect(sheet).toHaveAttribute('data-open', 'true');
    await user.click(sheet);
    expect(mockProps.toggleMenu).toHaveBeenCalledTimes(1);
  });

  it('should call setUnit when the radio group value changes', async () => {
    const user = userEvent.setup();
    render(<SettingsSheet {...mockProps} />);
    const radioGroup = screen.getByTestId('radio-group');
    await user.click(radioGroup);
    expect(mockProps.setUnit).toHaveBeenCalledWith('km');
  });
});