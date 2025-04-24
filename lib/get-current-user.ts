// lib/auth/getCurrentUser.ts
import { auth } from "@/server/auth"; // or wherever your auth config lives
import { Session } from "next-auth";

export const getCurrentUser = async (): Promise<Session["user"] | null> => {
  const session = await auth();

  if (!session?.user) return null;

  return session.user; // includes id, name, email, role, image
};
