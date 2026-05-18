jest.mock("@/lib/prisma", () => ({
  prisma: {
    subscription: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/resend", () => ({
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendSignupAdminNotification: jest.fn(),
}));

jest.mock("@/services/subscription", () => ({
  getStarterUsagePeriod: () => ({
    start: new Date("2026-01-01"),
    end: new Date("2026-02-01"),
  }),
}));

jest.mock("@/lib/auth-tracking", () => ({
  trackUserRegistered: jest.fn(),
  trackUserLogin: jest.fn(),
}));

import { prisma } from "@/lib/prisma";
import { sendSignupAdminNotification, sendVerificationEmail } from "@/lib/resend";
import { trackUserLogin, trackUserRegistered } from "@/lib/auth-tracking";
import { onCreateUser, onSignIn } from "./auth-events";

const mockPrisma = prisma as unknown as {
  subscription: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
};
const mockSendSignupAdminNotification = sendSignupAdminNotification as jest.Mock;
const mockSendVerificationEmail = sendVerificationEmail as jest.Mock;
const mockTrackUserRegistered = trackUserRegistered as jest.Mock;
const mockTrackUserLogin = trackUserLogin as jest.Mock;

describe("onCreateUser (Google OAuth new user)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.subscription.findUnique.mockResolvedValue(null);
    mockPrisma.subscription.create.mockResolvedValue({ userId: "user-1" });
    mockSendSignupAdminNotification.mockResolvedValue(undefined);
    mockTrackUserRegistered.mockResolvedValue(undefined);
  });

  it("creates a starter subscription and tracks signup as google", async () => {
    await onCreateUser({
      user: { id: "user-1", email: "alice@example.com" },
    });

    expect(mockPrisma.subscription.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        tier: "starter",
        status: "active",
      }),
    });

    expect(mockTrackUserRegistered).toHaveBeenCalledWith({
      user: { id: "user-1", email: "alice@example.com" },
      method: "google",
      provider: "google",
      tier: "starter",
    });
    expect(mockSendSignupAdminNotification).toHaveBeenCalledWith("alice@example.com");
    expect(mockSendVerificationEmail).not.toHaveBeenCalled();
  });

  it("does not duplicate the starter subscription if one already exists", async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue({ userId: "user-1" });

    await onCreateUser({
      user: { id: "user-1", email: "alice@example.com" },
    });

    expect(mockPrisma.subscription.create).not.toHaveBeenCalled();
    expect(mockSendSignupAdminNotification).toHaveBeenCalledWith("alice@example.com");
    expect(mockTrackUserRegistered).toHaveBeenCalledTimes(1);
  });

  it("does nothing if user is missing id or email", async () => {
    await onCreateUser({ user: { email: "no-id@example.com" } as never });
    expect(mockSendSignupAdminNotification).not.toHaveBeenCalled();
    expect(mockTrackUserRegistered).not.toHaveBeenCalled();
    expect(mockPrisma.subscription.create).not.toHaveBeenCalled();
  });

  it("does not send verification email or abort signup when the admin notification fails", async () => {
    mockSendSignupAdminNotification.mockRejectedValue(new Error("Resend unreachable"));
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      onCreateUser({ user: { id: "user-9", email: "x@example.com" } }),
    ).resolves.toBeUndefined();

    expect(mockSendSignupAdminNotification).toHaveBeenCalledWith("x@example.com");
    expect(mockSendVerificationEmail).not.toHaveBeenCalled();
    expect(mockTrackUserRegistered).toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("does not throw when analytics tracking fails", async () => {
    mockTrackUserRegistered.mockRejectedValue(new Error("PostHog unreachable"));
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      onCreateUser({ user: { id: "user-9", email: "x@example.com" } }),
    ).resolves.toBeUndefined();

    expect(mockPrisma.subscription.create).toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe("onSignIn (Google OAuth existing user)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTrackUserLogin.mockResolvedValue(undefined);
  });

  it("tracks login_completed for existing google users", async () => {
    await onSignIn({
      user: { id: "user-2", email: "bob@example.com" },
      account: { provider: "google", providerAccountId: "g-1", type: "oauth" },
      isNewUser: false,
    });

    expect(mockTrackUserLogin).toHaveBeenCalledWith({
      user: { id: "user-2", email: "bob@example.com" },
      method: "google",
      provider: "google",
    });
  });

  it("skips tracking for new google users (handled by createUser)", async () => {
    await onSignIn({
      user: { id: "user-3", email: "carol@example.com" },
      account: { provider: "google", providerAccountId: "g-2", type: "oauth" },
      isNewUser: true,
    });

    expect(mockTrackUserLogin).not.toHaveBeenCalled();
  });

  it("skips tracking for credentials provider (handled client-side)", async () => {
    await onSignIn({
      user: { id: "user-4", email: "dave@example.com" },
      account: { provider: "credentials", providerAccountId: "c-1", type: "credentials" },
      isNewUser: false,
    });

    expect(mockTrackUserLogin).not.toHaveBeenCalled();
  });

  it("does not throw when analytics tracking fails", async () => {
    mockTrackUserLogin.mockRejectedValue(new Error("PostHog unreachable"));
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      onSignIn({
        user: { id: "user-5", email: "eve@example.com" },
        account: { provider: "google", providerAccountId: "g-3", type: "oauth" },
        isNewUser: false,
      }),
    ).resolves.toBeUndefined();

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
