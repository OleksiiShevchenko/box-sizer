import { render, screen } from "@testing-library/react";
import GoogleSignupSuccessPage from "./page";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

jest.mock("@/components/marketing/google-ads-signup-conversion", () => ({
  GoogleAdsSignupConversion: ({
    claimUrl,
    fireConversion,
    redirectTo,
  }: {
    claimUrl?: string;
    fireConversion?: boolean;
    redirectTo?: string;
  }) => (
    <div
      data-testid="google-ads-signup-conversion"
      data-claim-url={claimUrl}
      data-fire-conversion={String(fireConversion)}
      data-redirect-to={redirectTo}
    />
  ),
}));

const mockedAuth = auth as jest.Mock;
const mockedFindFirst = prisma.user.findFirst as jest.Mock;
const mockedRedirect = redirect as unknown as jest.Mock;

describe("GoogleSignupSuccessPage", () => {
  const originalVercelEnv = process.env.VERCEL_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.VERCEL_ENV = "production";
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockedFindFirst.mockResolvedValue({ id: "user-1" });
  });

  afterEach(() => {
    if (originalVercelEnv === undefined) {
      delete process.env.VERCEL_ENV;
      return;
    }

    process.env.VERCEL_ENV = originalVercelEnv;
  });

  it("fires the conversion and redirects recent Google signups to the dashboard", async () => {
    render(await GoogleSignupSuccessPage());

    expect(screen.getByText("Completing sign up")).toBeInTheDocument();
    expect(screen.getByTestId("google-ads-signup-conversion")).toHaveAttribute(
      "data-claim-url",
      "/api/marketing/google-signup-conversion/claim",
    );
    expect(screen.getByTestId("google-ads-signup-conversion")).toHaveAttribute(
      "data-fire-conversion",
      "true",
    );
    expect(screen.getByTestId("google-ads-signup-conversion")).toHaveAttribute(
      "data-redirect-to",
      "/dashboard",
    );
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("redirects existing Google users without firing a signup conversion", async () => {
    mockedFindFirst.mockResolvedValue(null);

    await expect(GoogleSignupSuccessPage()).rejects.toThrow("redirect:/dashboard");
    expect(mockedRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("renders the success page without firing the conversion outside production", async () => {
    process.env.VERCEL_ENV = "preview";

    render(await GoogleSignupSuccessPage());

    expect(screen.getByText("Completing sign up")).toBeInTheDocument();
    expect(screen.getByTestId("google-ads-signup-conversion")).not.toHaveAttribute(
      "data-claim-url",
    );
    expect(screen.getByTestId("google-ads-signup-conversion")).toHaveAttribute(
      "data-fire-conversion",
      "false",
    );
    expect(screen.getByTestId("google-ads-signup-conversion")).toHaveAttribute(
      "data-redirect-to",
      "/dashboard",
    );
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated visitors to signup", async () => {
    mockedAuth.mockResolvedValue(null);

    await expect(GoogleSignupSuccessPage()).rejects.toThrow("redirect:/signup");
    expect(mockedRedirect).toHaveBeenCalledWith("/signup");
  });
});
