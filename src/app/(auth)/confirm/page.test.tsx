import { render, screen, waitFor } from "@testing-library/react";
import ConfirmPage from "./page";

const mockConfirmEmail = jest.fn();
const mockUseSearchParams = jest.fn();

jest.mock("@/actions/auth-actions", () => ({
  confirmEmail: (...args: unknown[]) => mockConfirmEmail(...args),
}));

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
}));

describe("ConfirmPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams("token=token-123&email=user@example.com")
    );
    mockConfirmEmail.mockResolvedValue({ success: true });
  });

  it("confirms the email once and shows the success state", async () => {
    render(<ConfirmPage />);

    expect(screen.getByText("Confirming your email...")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockConfirmEmail).toHaveBeenCalledTimes(1);
    });

    expect(mockConfirmEmail).toHaveBeenCalledWith("token-123", "user@example.com");
    expect(await screen.findByText("Email Confirmed!")).toBeInTheDocument();
  });
});
