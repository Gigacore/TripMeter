import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SettingsIcon from './SettingsIcon';

describe('SettingsIcon', () => {
  it('should render the svg icon', () => {
    render(<SettingsIcon />);

    const svgElement = screen.getByTestId('settings-icon');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement.tagName).toBe('svg');
  });
});