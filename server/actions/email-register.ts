//server/action/email-register.ts
"use server";
import { RegisterSchema } from "@/types/register-schema";
import bcrypt from "bcryptjs";
import { db } from "..";
import { eq } from "drizzle-orm";
import { users } from "../schema";
import { actionClient } from "@/lib/safe-actions";

import { fail, ok } from "@/types/result";
export const emailRegister = actionClient
  .schema(RegisterSchema)
  .action(async ({ parsedInput: { email, password, name } }) => {
    try {
      //check if email already in use
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (existingUser) {
        return fail("Email already in use");
      }
      //hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(hashedPassword);
      const user = await db.insert(users).values({
        email,
        name,
        password: hashedPassword,
      });
      console.log("user", user);
      return ok({ email });
    } catch (error) {
      return fail(error.message ?? "Error creating user");
    }
  });
