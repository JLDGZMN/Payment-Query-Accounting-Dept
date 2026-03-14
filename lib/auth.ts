import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { createPool } from "mysql2/promise";

export const auth = betterAuth({
  database: createPool(process.env.DATABASE_URL!),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username()],
});
