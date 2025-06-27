/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";

describe("ConfigTemplatePage", () => {
  it("renders textarea for admin", async () => {
    jest.doMock("../../hooks/useAuth", () => ({
      useAuth: () => ({ user: { role: "admin" } }),
    }));
    const { default: Page } = await import("../Admin/ConfigTemplatePage");
    render(<Page />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    jest.dontMock("../../hooks/useAuth");
  });

  it("shows forbidden for user", async () => {
    jest.doMock("../../hooks/useAuth", () => ({
      useAuth: () => ({ user: { role: "user" } }),
    }));
    const { default: Page } = await import("../Admin/ConfigTemplatePage");
    render(<Page />);
    expect(screen.getByText(/403/i)).toBeInTheDocument();
    jest.dontMock("../../hooks/useAuth");
  });
});
