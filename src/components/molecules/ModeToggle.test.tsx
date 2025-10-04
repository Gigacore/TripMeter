import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ModeToggle } from './ModeToggle';
import { useTheme } from '../ThemeProvider';

vi.mock('../ThemeProvider', () => ({
  useTheme: vi.fn(),
}));

describe('ModeToggle', () => {
  it('should call setTheme with "dark" when the current theme is "light"', async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn();
    (useTheme as vi.Mock).mockReturnValue({ theme: 'light', setTheme });

    render(<ModeToggle />);

    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(toggleButton);

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('should call setTheme with "light" when the current theme is "dark"', async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn();
    (useTheme as vi.Mock).mockReturnValue({ theme: 'dark', setTheme });

    render(<ModeToggle />);

    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(toggleButton);

    expect(setTheme).toHaveBeenCalledWith('light');
  });
});