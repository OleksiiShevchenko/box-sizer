import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authorizeCredentials } from "./auth-credentials";
import { EMAIL_NOT_VERIFIED_CODE } from "@/lib/auth-error-codes";

jest.mock("next-auth", () => ({
  CredentialsSignin: class CredentialsSignin extends Error {
    code = "credentials";
  },
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
  },
}));

const mockedFindUnique = prisma.user.findUnique as jest.Mock;
const mockedCompare = bcrypt.compare as jest.Mock;

describe("authorizeCredentials", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws a handled credentials error for unverified email users", async () => {
    mockedFindUnique.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      password: "hashed-password",
      emailVerified: null,
      name: "Test User",
      image: null,
    });

    await expect(
      authorizeCredentials({
        email: "user@example.com",
        password: "password123",
      }),
    ).rejects.toMatchObject({
      code: EMAIL_NOT_VERIFIED_CODE,
    });

    expect(mockedCompare).not.toHaveBeenCalled();
  });

  it("returns the user for verified email users with a valid password", async () => {
    mockedFindUnique.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      password: "hashed-password",
      emailVerified: new Date(),
      name: "Test User",
      image: null,
    });
    mockedCompare.mockResolvedValue(true);

    await expect(
      authorizeCredentials({
        email: "user@example.com",
        password: "password123",
      }),
    ).resolves.toEqual({
      id: "user-1",
      email: "user@example.com",
      name: "Test User",
      image: null,
    });
  });
});
