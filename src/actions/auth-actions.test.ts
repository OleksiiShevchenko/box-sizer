jest.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn(),
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    verificationToken: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock("@/lib/resend", () => ({
  sendVerificationEmail: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
  },
}));

jest.mock("crypto", () => ({
  __esModule: true,
  default: {
    randomBytes: jest.fn(),
  },
}));

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/resend";
import { signUp } from "./auth-actions";

const mockPrisma = prisma as unknown as {
  $transaction: jest.Mock;
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
  };
  verificationToken: {
    create: jest.Mock;
    deleteMany: jest.Mock;
  };
};

const mockSendVerificationEmail = sendVerificationEmail as jest.Mock;

describe("signUp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((operations: Promise<unknown>[]) => Promise.all(operations));
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: "user-1" });
    mockPrisma.user.delete.mockResolvedValue({ id: "user-1" });
    mockPrisma.verificationToken.create.mockResolvedValue({ identifier: "user@example.com" });
    mockPrisma.verificationToken.deleteMany.mockResolvedValue({ count: 1 });
    mockSendVerificationEmail.mockResolvedValue(undefined);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
    (crypto.randomBytes as jest.Mock).mockReturnValue({
      toString: () => "verification-token",
    });
  });

  it("removes the user and verification token when email delivery fails", async () => {
    mockSendVerificationEmail.mockRejectedValue(new Error("Resend failed"));

    const formData = new FormData();
    formData.set("name", "Test User");
    formData.set("email", "user@example.com");
    formData.set("password", "password123");
    formData.set("locale", "en-US");

    const result = await signUp(formData);

    expect(result).toEqual({
      error: "Failed to send verification email. Please try again.",
    });
    expect(mockSendVerificationEmail).toHaveBeenCalledWith("user@example.com", "verification-token");
    expect(mockPrisma.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: "user@example.com" },
    });
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({
      where: { email: "user@example.com" },
    });
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
