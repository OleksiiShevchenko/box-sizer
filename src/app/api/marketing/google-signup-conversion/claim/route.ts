import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const GOOGLE_SIGNUP_CONVERSION = "google_ads_signup";
const GOOGLE_SIGNUP_CONVERSION_WINDOW_MS = 10 * 60 * 1000;

function json(data: { claimed: boolean }, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return json({ claimed: false }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - GOOGLE_SIGNUP_CONVERSION_WINDOW_MS);
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      createdAt: { gte: cutoff },
      accounts: {
        some: { provider: "google" },
      },
    },
    select: { id: true },
  });

  if (!user) {
    return json({ claimed: false }, { status: 409 });
  }

  try {
    await prisma.signupConversion.create({
      data: {
        userId,
        conversion: GOOGLE_SIGNUP_CONVERSION,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return json({ claimed: false }, { status: 409 });
    }

    throw error;
  }

  return json({ claimed: true });
}
