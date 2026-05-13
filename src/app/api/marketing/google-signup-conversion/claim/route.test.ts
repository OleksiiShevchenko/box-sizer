import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { POST } from "./route";

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
    },
    signupConversion: {
      create: jest.fn(),
    },
  },
}));

const mockedAuth = auth as jest.Mock;
const mockedFindFirst = prisma.user.findFirst as jest.Mock;
const mockedCreate = prisma.signupConversion.create as jest.Mock;

describe("POST /api/marketing/google-signup-conversion/claim", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockedFindFirst.mockResolvedValue({ id: "user-1" });
    mockedCreate.mockResolvedValue({ id: "claim-1" });
  });

  it("claims the Google signup conversion once for a recent Google user", async () => {
    const response = await POST();

    await expect(response.json()).resolves.toEqual({ claimed: true });
    expect(response.status).toBe(200);
    expect(mockedCreate).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        conversion: "google_ads_signup",
      },
    });
  });

  it("rejects duplicate claims", async () => {
    mockedCreate.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("duplicate", {
        code: "P2002",
        clientVersion: "5.22.0",
      }),
    );

    const response = await POST();

    await expect(response.json()).resolves.toEqual({ claimed: false });
    expect(response.status).toBe(409);
  });

  it("rejects users who are not recent Google signups", async () => {
    mockedFindFirst.mockResolvedValue(null);

    const response = await POST();

    await expect(response.json()).resolves.toEqual({ claimed: false });
    expect(response.status).toBe(409);
    expect(mockedCreate).not.toHaveBeenCalled();
  });
});
