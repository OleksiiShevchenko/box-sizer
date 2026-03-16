import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileForm } from "./profile-form";

const updateEmail = jest.fn();
const updatePassword = jest.fn();

jest.mock("@/actions/profile-actions", () => ({
  updateEmail: (...args: unknown[]) => updateEmail(...args),
  updatePassword: (...args: unknown[]) => updatePassword(...args),
}));

describe("ProfileForm", () => {
  beforeEach(() => {
    updateEmail.mockReset();
    updatePassword.mockReset();
  });

  it("renders editable email and password section for credentials users", () => {
    render(
      <ProfileForm
        profile={{
          name: "Alex",
          email: "alex@example.com",
          image: null,
          isGoogleUser: false,
          hasPassword: true,
          unitSystem: "cm",
        }}
      />
    );

    expect(screen.getByLabelText("Email")).not.toBeDisabled();
    expect(screen.getByRole("heading", { name: "Change Password" })).toBeInTheDocument();
  });

  it("renders read-only email and hides password for Google SSO users", () => {
    render(
      <ProfileForm
        profile={{
          name: "Alex",
          email: "alex@example.com",
          image: null,
          isGoogleUser: true,
          hasPassword: false,
          unitSystem: "cm",
        }}
      />
    );

    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByText("Google SSO")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Change Password" })).not.toBeInTheDocument();
  });

  it("submits email updates", async () => {
    const user = userEvent.setup();
    updateEmail.mockResolvedValue({ success: true });

    render(
      <ProfileForm
        profile={{
          name: "Alex",
          email: "alex@example.com",
          image: null,
          isGoogleUser: false,
          hasPassword: true,
          unitSystem: "cm",
        }}
      />
    );

    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "next@example.com");
    await user.click(screen.getByRole("button", { name: "Save Email" }));

    await waitFor(() => {
      expect(updateEmail).toHaveBeenCalledWith("next@example.com");
      expect(screen.getByText("Email updated.")).toBeInTheDocument();
    });
  });

  it("validates password confirmation before submitting", async () => {
    const user = userEvent.setup();

    render(
      <ProfileForm
        profile={{
          name: "Alex",
          email: "alex@example.com",
          image: null,
          isGoogleUser: false,
          hasPassword: true,
          unitSystem: "cm",
        }}
      />
    );

    await user.type(screen.getByLabelText("Current Password"), "current-password");
    await user.type(screen.getByLabelText("New Password"), "new-password");
    await user.type(screen.getByLabelText("Confirm New Password"), "different-password");
    await user.click(screen.getByRole("button", { name: "Update Password" }));

    expect(updatePassword).not.toHaveBeenCalled();
    expect(screen.getByText("New password and confirmation must match")).toBeInTheDocument();
  });
});
