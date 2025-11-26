import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CustomizedContent from './CustomizedContent';
import { assertAccessible } from '../../tests/utils';

const mockProps = {
  root: {},
  depth: 1,
  x: 10,
  y: 20,
  width: 100,
  height: 50,
  index: 0,
  colors: ['#ff0000', '#00ff00'],
  name: 'Test Node',
};

describe('CustomizedContent', () => {
  it('should be accessible', async () => {
    await assertAccessible(
      <svg>
        <CustomizedContent {...mockProps} />
      </svg>
    );
  });

  it('should render the name when depth is 1', () => {
    render(
      <svg>
        <CustomizedContent {...mockProps} />
      </svg>
    );
    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });

  it('should not render the name when depth is not 1', () => {
    render(
      <svg>
        <CustomizedContent {...mockProps} depth={2} />
      </svg>
    );
    expect(screen.queryByText('Test Node')).not.toBeInTheDocument();
  });

  it('should render a rect with the correct position and size', () => {
    const { container } = render(
      <svg>
        <CustomizedContent {...mockProps} />
      </svg>
    );
    const rect = container.querySelector('rect');
    expect(rect).toHaveAttribute('x', '10');
    expect(rect).toHaveAttribute('y', '20');
    expect(rect).toHaveAttribute('width', '100');
    expect(rect).toHaveAttribute('height', '50');
  });

  it('should apply the correct color based on the index', () => {
    const { container } = render(
      <svg>
        <CustomizedContent {...mockProps} index={1} />
      </svg>
    );
    const rect = container.querySelector('rect');
    expect(rect).toHaveStyle({ fill: '#00ff00' });
  });
});