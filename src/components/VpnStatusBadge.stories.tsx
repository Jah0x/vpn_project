import type { Meta, StoryObj } from '@storybook/react';
import VpnStatusBadge from './VpnStatusBadge';

const meta: Meta<typeof VpnStatusBadge> = {
  component: VpnStatusBadge,
  title: 'Components/VpnStatusBadge'
};
export default meta;

type Story = StoryObj<typeof VpnStatusBadge>;

export const Online: Story = { args: { status: 'online' } };
export const Offline: Story = { args: { status: 'offline' } };
export const Warning: Story = { args: { status: 'warning' } };
export const Pending: Story = { args: { status: 'pending' } };
