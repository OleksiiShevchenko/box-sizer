import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signIn } from "next-auth/react";
import { SignupForm } from "./signup-form";

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("posthog-js", () => ({
  identify: jest.fn(),
  capture: jest.fn(),
}));

jest.mock("@/actions/auth-actions", () => ({
  signUp: jest.fn(),
}));

const mockedSignIn = signIn as jest.Mock;

describe("SignupForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns Google OAuth signups through the conversion success page", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.click(screen.getByRole("button", { name: "Continue with Google" }));

    expect(mockedSignIn).toHaveBeenCalledWith("google", {
      callbackUrl: "/signup/google/success",
    });
  });
});
