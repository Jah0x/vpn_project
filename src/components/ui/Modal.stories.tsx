import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Modal from "./Modal";
import Button from "./Button";

const meta: Meta<typeof Modal> = {
  component: Modal,
  title: "UI/Modal",
};
export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Modal"
          footer={<Button onClick={() => setOpen(false)}>Close</Button>}
        >
          Content
        </Modal>
      </>
    );
  },
};
