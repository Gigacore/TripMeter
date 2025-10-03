import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ModeToggle } from './ModeToggle';
import { useTheme } from '../ThemeProvider';

vi.mock('../ThemeProvider', () => ({
  useTheme: vi.fn(),
}));

describe('ModeToggle', () => {
  it('should call setTheme with "light" when Light is clicked', async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn();
    (useTheme as vi.Mock).mockReturnValue({ setTheme });

    render(<ModeToggle />);

    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByRole('menuitem', { name: 'Light' }));

    expect(setTheme).toHaveBeenCalledWith('light');
  });

  it('should call setTheme with "dark" when Dark is clicked', async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn();
    (useTheme as vi.Mock).mockReturnValue({ setTheme });

    render(<ModeToggle />);

    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByRole('menuitem', { name: 'Dark' }));

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('should call setTheme with "system" when System is clicked', async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn();
    (useTheme as vi.Mock).mockReturnValue({ setTheme });

    render(<ModeToggle />);

    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByRole('menuitem', { name: 'System' }));

    expect(setTheme).toHaveBeenCalledWith('system');
  });
});