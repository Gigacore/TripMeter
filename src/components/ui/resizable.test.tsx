import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './resizable';

// Mock lucide-react dependency
vi.mock('lucide-react', () => ({
  GripVertical: () => <div data-testid="grip-vertical-icon" />,
}));

describe('Resizable Components', () => {
  it('should render the ResizablePanelGroup and ResizablePanel', () => {
    render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>
          <div>Panel 1</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    );

    expect(screen.getByText('Panel 1')).toBeInTheDocument();
  });

  it('should render the handle with a grip icon when withHandle is true', () => {
    render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50} />
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} />
      </ResizablePanelGroup>
    );

    expect(screen.getByTestId('grip-vertical-icon')).toBeInTheDocument();
  });

  it('should render the handle without a grip icon when withHandle is false', () => {
    render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50} />
        <ResizableHandle withHandle={false} />
        <ResizablePanel defaultSize={50} />
      </ResizablePanelGroup>
    );

    expect(screen.queryByTestId('grip-vertical-icon')).not.toBeInTheDocument();
  });

  it('should render the handle without a grip icon by default', () => {
    render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50} />
        <ResizableHandle />
        <ResizablePanel defaultSize={50} />
      </ResizablePanelGroup>
    );

    expect(screen.queryByTestId('grip-vertical-icon')).not.toBeInTheDocument();
  });
});