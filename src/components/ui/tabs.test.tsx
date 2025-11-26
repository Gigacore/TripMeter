import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

const TestTabs = () => (
  <Tabs defaultValue="tab1">
    <TabsList>
      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
      <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">Content 1</TabsContent>
    <TabsContent value="tab2">Content 2</TabsContent>
  </Tabs>
);

describe('Tabs', () => {
  it('should render the tabs and default content', () => {
    render(<TestTabs />);

    expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('should switch to the second tab when clicked', async () => {
    const user = userEvent.setup();
    render(<TestTabs />);

    const tab2Trigger = screen.getByRole('tab', { name: 'Tab 2' });
    await user.click(tab2Trigger);

    expect(await screen.findByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });

  it('should have the active tab with the correct data state', async () => {
    const user = userEvent.setup();
    render(<TestTabs />);

    const tab1Trigger = screen.getByRole('tab', { name: 'Tab 1' });
    const tab2Trigger = screen.getByRole('tab', { name: 'Tab 2' });

    expect(tab1Trigger).toHaveAttribute('data-state', 'active');
    expect(tab2Trigger).toHaveAttribute('data-state', 'inactive');

    await user.click(tab2Trigger);

    expect(tab1Trigger).toHaveAttribute('data-state', 'inactive');
    expect(tab2Trigger).toHaveAttribute('data-state', 'active');
  });
});