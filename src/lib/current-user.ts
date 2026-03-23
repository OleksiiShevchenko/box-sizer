import { cache } from "react";
import { auth } from "@/lib/auth";

export const getCurrentUser = cache(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user;
});

export async function getCurrentUserId(): Promise<string> {
  return (await getCurrentUser()).id;
}
