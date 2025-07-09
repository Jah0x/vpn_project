/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";

jest.mock("../../services/VPNService", () => ({
  default: { getConfig: jest.fn(), regenerateConfig: jest.fn() },
}));
jest.mock("../../services/MonitoringService", () => ({
  default: { getServerStats: jest.fn(), getUserStats: jest.fn() },
}));
jest.mock("../../contexts/ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

describe("Dashboard subscription link button", () => {
  it("renders button when subscription active", async () => {
    jest.doMock("../../hooks/useAuth", () => ({
      useAuth: () => ({ user: { subscription: { status: "active" } } }),
    }));
    const { default: Dashboard } = await import("../Dashboard/Dashboard");
    render(<Dashboard />);
    expect(
      screen.getByRole("button", { name: /копировать ссылку/i }),
    ).toBeInTheDocument();
    jest.dontMock("../../hooks/useAuth");
  });

  it("hides button when subscription inactive", async () => {
    jest.doMock("../../hooks/useAuth", () => ({
      useAuth: () => ({ user: { subscription: { status: "past_due" } } }),
    }));
    const { default: Dashboard } = await import("../Dashboard/Dashboard");
    render(<Dashboard />);
    expect(
      screen.queryByRole("button", { name: /копировать ссылку/i }),
    ).toBeNull();
    jest.dontMock("../../hooks/useAuth");
  });
});
