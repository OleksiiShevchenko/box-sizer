import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signIn } from "next-auth/react";
import { LoginForm } from "./login-form";
import { EMAIL_NOT_VERIFIED_CODE } from "@/lib/auth-error-codes";

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock("posthog-js", () => ({
  identify: jest.fn(),
  capture: jest.fn(),
}));

const mockedSignIn = signIn as jest.Mock;

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows the verification message for unverified email credentials", async () => {
    mockedSignIn.mockResolvedValue({
      error: "CredentialsSignin",
      code: EMAIL_NOT_VERIFIED_CODE,
      ok: false,
      status: 200,
      url: null,
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(
      await screen.findByText("Please verify your email before signing in."),
    ).toBeInTheDocument();
  });
});
