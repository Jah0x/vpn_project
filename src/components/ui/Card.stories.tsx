import type { Meta, StoryObj } from "@storybook/react";
import Card from "./Card";

const meta: Meta<typeof Card> = {
  component: Card,
  title: "UI/Card",
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card>
      <div className="text-center">Card content</div>
    </Card>
  ),
};
