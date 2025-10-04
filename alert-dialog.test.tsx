import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog';

describe('AlertDialog', () => {
  it('should render the dialog and handle actions correctly', async () => {
    const user = userEvent.setup();
    const onActionClick = vi.fn();

    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button>Open Dialog</button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onActionClick}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    // 1. Initial state: Dialog is closed
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();

    // 2. Open the dialog
    await user.click(screen.getByRole('button', { name: /open dialog/i }));
    expect(await screen.findByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();

    // 3. Close with the cancel button
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();

    // 4. Re-open and test the action button
    await user.click(screen.getByRole('button', { name: /open dialog/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(onActionClick).toHaveBeenCalledTimes(1);
  });
});