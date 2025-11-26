import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Label } from './label';
import { useState } from 'react';

// Mock lucide-react dependency
vi.mock('lucide-react', () => ({
  Circle: () => <div data-testid="circle-icon" />,
}));

const TestRadioGroup = () => {
  const [value, setValue] = useState('option-one');
  return (
    <RadioGroup defaultValue={value} onValueChange={setValue}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="r1" />
        <Label htmlFor="r1">Option One</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="r2" />
        <Label htmlFor="r2">Option Two</Label>
      </div>
    </RadioGroup>
  );
};

describe('RadioGroup', () => {
  it('should render the radio group with its items', () => {
    render(<TestRadioGroup />);

    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getByLabelText('Option One')).toBeInTheDocument();
    expect(screen.getByLabelText('Option Two')).toBeInTheDocument();
  });

  it('should have the default item checked', () => {
    render(<TestRadioGroup />);

    const optionOne = screen.getByLabelText('Option One');
    expect(optionOne).toBeChecked();
  });

  it('should change the checked item on click', async () => {
    const user = userEvent.setup();
    render(<TestRadioGroup />);

    const optionOne = screen.getByLabelText('Option One');
    const optionTwo = screen.getByLabelText('Option Two');

    expect(optionOne).toBeChecked();
    expect(optionTwo).not.toBeChecked();

    await user.click(optionTwo);

    expect(optionOne).not.toBeChecked();
    expect(optionTwo).toBeChecked();
  });
});