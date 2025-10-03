import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SankeyNode from './SankeyNode';

vi.mock('recharts', () => ({
  Layer: ({ children }: { children: React.ReactNode }) => <g>{children}</g>,
  Rectangle: (props: any) => <rect {...props} />,
}));

const mockProps = {
  x: 10,
  y: 20,
  width: 100,
  height: 50,
  index: 0,
  payload: { name: 'Successful', value: 123 },
  onShowTripList: vi.fn(),
};

describe('SankeyNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the node with the correct text', () => {
    render(
      <svg>
        <SankeyNode {...mockProps} />
      </svg>
    );
    expect(screen.getByText('Successful (123)')).toBeInTheDocument();
  });

  it('should call onShowTripList with the correct type when clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <svg>
        <SankeyNode {...mockProps} />
      </svg>
    );

    const rect = container.querySelector('rect');
    if (rect) {
      await user.click(rect);
    }

    expect(mockProps.onShowTripList).toHaveBeenCalledWith('successful');
  });

  it('should not be clickable if the name is "Total Requests"', async () => {
    const user = userEvent.setup();
    const nonClickableProps = {
      ...mockProps,
      payload: { name: 'Total Requests', value: 200 },
    };
    const { container } = render(
      <svg>
        <SankeyNode {...nonClickableProps} />
      </svg>
    );

    const rect = container.querySelector('rect');
    if (rect) {
        await user.click(rect);
    }

    expect(mockProps.onShowTripList).not.toHaveBeenCalled();
  });

  it('should have a pointer cursor when clickable', () => {
    const { container } = render(
      <svg>
        <SankeyNode {...mockProps} />
      </svg>
    );
    expect(container.querySelector('rect')).toHaveAttribute('cursor', 'pointer');
  });

  it('should have a default cursor when not clickable', () => {
    const nonClickableProps = {
        ...mockProps,
        payload: { name: 'Total Requests', value: 200 },
      };
    const { container } = render(
      <svg>
        <SankeyNode {...nonClickableProps} />
      </svg>
    );
    expect(container.querySelector('rect')).toHaveAttribute('cursor', 'default');
  });
});