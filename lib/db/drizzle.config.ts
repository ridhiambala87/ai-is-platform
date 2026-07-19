import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";
import path from "path";

// .env lives at the project root; try two levels up (when run from lib/db/)
// and fall back to CWD root (when run from project root directly)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, ".env") });
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Add it to your .env file in the project root.",
  );
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
