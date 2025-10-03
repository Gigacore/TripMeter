import React from 'react';
import { render, screen } from '@testing-library/react';
import { CustomTooltip } from './index';
import { TooltipPayload } from '@/types';

describe('CustomTooltip', () => {
  const mockPayload: TooltipPayload[] = [
    { name: 'Fare', value: 25.5, dataKey: 'monetary' },
    { name: 'Distance', value: 10.234, dataKey: 'distance' },
  ];

  it('renders correctly with active and payload', () => {
    render(<CustomTooltip active={true} payload={mockPayload} label="Trip 1" />);

    expect(screen.getByText('Trip 1')).toBeInTheDocument();
    expect(screen.getByText('Fare')).toBeInTheDocument();
    expect(screen.getByText('$25.50')).toBeInTheDocument();
    expect(screen.getByText('Distance')).toBeInTheDocument();
    expect(screen.getByText('10.23 mi')).toBeInTheDocument();
  });

  it('returns null when not active', () => {
    const { container } = render(<CustomTooltip active={false} payload={mockPayload} label="Trip 1" />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when payload is empty', () => {
    const { container } = render(<CustomTooltip active={true} payload={[]} label="Trip 1" />);
    expect(container.firstChild).toBeNull();
  });
});