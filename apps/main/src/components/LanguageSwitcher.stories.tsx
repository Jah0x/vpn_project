import type { Meta, StoryObj } from "@storybook/react";
import LanguageSwitcher from "./LanguageSwitcher";

const meta: Meta<typeof LanguageSwitcher> = {
  component: LanguageSwitcher,
  title: "Components/LanguageSwitcher",
};
export default meta;

type Story = StoryObj<typeof LanguageSwitcher>;

export const Default: Story = { render: () => <LanguageSwitcher /> };
