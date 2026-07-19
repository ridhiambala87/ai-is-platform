// This file MUST be the first import in index.ts.
// In ESM, side-effect imports run in order, so dotenv loads
// before @workspace/db evaluates and checks DATABASE_URL.
import dotenv from "dotenv";
import path from "path";

// When running from artifacts/api-server/, .env is two levels up at project root.
// Falls back to CWD root for hosted environments where .env might be co-located.
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
