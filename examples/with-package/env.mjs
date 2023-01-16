//@ts-check
import { validateEnvironmentVariables } from "next-validenv";

import { z } from "zod";

/**
 * Specify your environment variables schema here.
 * This way, you can ensure the app isn't built with invalid environment variables.
 * By default, environment variables are only available in the Node.js environment, meaning they won't be exposed to the browser. In order to expose a variable to the browser you have to prefix the variable with NEXT_PUBLIC_.
 * -> Don't use any Zod .transform() methods in the schema (will cause `implicitly has type 'any'` error) <-
 */
export const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXT_PUBLIC_TEST: z.string(),
});

/**
 * Environment variable declarations based on the schema help structure your environment variables programmatically.
 * @type {{ [k in keyof z.infer<typeof schema>]: z.infer<typeof schema>[k] | undefined }}
 */
export const env = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_TEST: process.env.NEXT_PUBLIC_TEST,
};

validateEnvironmentVariables(schema, env);
