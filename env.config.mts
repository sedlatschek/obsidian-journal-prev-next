import process from "node:process";

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  OBSIDIAN_DEVELOPMENT_VAULT_PATH: z
    .string()
    .transform((value) => (value.trim() === "" ? null : value))
    .nullish(),
});
const config = schema.safeParse(process.env);

if (!config.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(config.error, null, 4),
  );
  process.exit(1);
}

export default config.data;
