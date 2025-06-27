import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import VpnCard from "../VpnCard";
import { Vpn } from "../../types/vpn";

global.fetch = jest.fn();

const vpn: Vpn = {
  id: "1",
  name: "Test VPN",
  status: "online",
  createdAt: "",
};

describe("VpnCard", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({ ok: true });
  });

  it("calls restart and disables button", async () => {
    render(<VpnCard vpn={vpn} jwt="token" />);
    const btn = screen.getByRole("button", { name: /restart/i });
    fireEvent.click(btn);
    expect(fetch).toHaveBeenCalledWith(
      "/api/vpn/restart/1",
      expect.objectContaining({ method: "POST" }),
    );
    expect(btn).toBeDisabled();
    await waitFor(() => expect(btn).not.toBeDisabled());
  });
});
