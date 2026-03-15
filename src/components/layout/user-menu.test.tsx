import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserMenu } from "./user-menu";

const signOut = jest.fn();

jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        name: "Alex Doe",
        email: "alex@example.com",
      },
    },
  }),
  signOut: (...args: unknown[]) => signOut(...args),
}));

describe("UserMenu", () => {
  beforeEach(() => {
    signOut.mockReset();
  });

  it("opens the dropdown and shows profile settings", async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    await user.click(screen.getByRole("button", { name: "User menu" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Profile Settings" })).toHaveAttribute(
      "href",
      "/settings/profile"
    );
  });

  it("calls signOut when logout is clicked", async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    await user.click(screen.getByRole("button", { name: "User menu" }));
    await user.click(screen.getByRole("menuitem", { name: "Logout" }));

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });

  it("closes on outside click and escape", async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    await user.click(screen.getByRole("button", { name: "User menu" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "User menu" }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
