import { CredentialsSignin } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { EMAIL_NOT_VERIFIED_CODE } from "@/lib/auth-error-codes";

export class EmailNotVerifiedSigninError extends CredentialsSignin {
  code = EMAIL_NOT_VERIFIED_CODE;
}

export async function authorizeCredentials(credentials: Partial<Record<"email" | "password", unknown>>) {
  const email = credentials?.email as string;
  const password = credentials?.password as string;

  if (!email || !password) return null;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) return null;

  if (!user.emailVerified) {
    throw new EmailNotVerifiedSigninError();
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  };
}
