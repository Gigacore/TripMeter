import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './sheet';

const TestSheet = ({ side }: { side?: 'top' | 'bottom' | 'left' | 'right' }) => (
  <Sheet>
    <SheetTrigger>Open Sheet</SheetTrigger>
    <SheetContent side={side}>
      <SheetHeader>
        <SheetTitle>Sheet Title</SheetTitle>
        <SheetDescription>Sheet Description</SheetDescription>
      </SheetHeader>
      <div>Sheet Content</div>
    </SheetContent>
  </Sheet>
);

describe('Sheet', () => {
  it('should not show the sheet content by default', () => {
    render(<TestSheet />);
    expect(screen.queryByText('Sheet Title')).not.toBeInTheDocument();
  });

  it('should show the sheet content when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<TestSheet />);

    const trigger = screen.getByText('Open Sheet');
    await user.click(trigger);

    expect(await screen.findByText('Sheet Title')).toBeInTheDocument();
    expect(screen.getByText('Sheet Description')).toBeInTheDocument();
    expect(screen.getByText('Sheet Content')).toBeInTheDocument();
  });

  it('should apply the correct classes for the "left" side variant', async () => {
    const user = userEvent.setup();
    render(<TestSheet side="left" />);

    await user.click(screen.getByText('Open Sheet'));

    const sheetContent = await screen.findByText('Sheet Content');
    // The parent of the content has the variant classes
    expect(sheetContent.parentElement).toHaveClass('inset-y-0', 'left-0');
  });
});