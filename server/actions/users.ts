import { db } from "@/server";
import { eq } from "drizzle-orm";
import { users } from "@/server/schema";
import bcrypt from "bcryptjs";

export async function getUserFromDb(email: string, pwd: string) {
  // Find user by email
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!existingUser) return null; // Return null if user is not found

  const isMatch = await bcrypt.compare(pwd, existingUser.password);
  console.log(isMatch);
  if (!isMatch) {
    return null; // Password mismatch
  }
  // Return user object excluding password for security
  const { password, ...userWithoutPassword } = existingUser;
  console.log(password);
  return userWithoutPassword;
}
