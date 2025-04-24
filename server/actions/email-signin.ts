//server/action/email-singin.ts
"use server";
import { LoginSchema } from "@/types/login-schema";
import { actionClient } from "@/lib/safe-actions";
import { eq } from "drizzle-orm";
import { signIn } from "@/server/auth";
import { users } from "@/server/schema";
import { db } from "@/server";
import { fail, ok, Result } from "@/types/result";
export const emailSignIn = actionClient
  .schema(LoginSchema)
  .action(
    async ({
      parsedInput: { email, password },
    }): Promise<Result<{ email: string }>> => {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (existingUser?.email !== email) {
        return fail("Email not found");
      }

      await signIn("credentials", { email, password, redirectTo: "/" });

      return ok({ email });
    }
  );
