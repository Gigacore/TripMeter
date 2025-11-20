import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SettingsIcon from './SettingsIcon';
import { assertAccessible } from '../../tests/utils';

describe('SettingsIcon', () => {
  it('should be accessible', async () => {
    await assertAccessible(<SettingsIcon />);
  });

  it('should render the svg icon', () => {
    render(<SettingsIcon />);

    const svgElement = screen.getByTestId('settings-icon');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement.tagName).toBe('svg');
  });
});