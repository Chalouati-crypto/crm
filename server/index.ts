import * as schema from "./schema";
import { drizzle } from "drizzle-orm/neon-http";
export const db = drizzle(process.env.POSTGRES_URL!, { schema });
