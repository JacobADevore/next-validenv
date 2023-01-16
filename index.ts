import { z } from "zod";

export const formatZodErrors = (
  errors: z.ZodFormattedError<Map<string, string>, string>
) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value)
        return `${name}: ${value._errors.join(", ")}\n`;

      return;
    })
    .filter(Boolean);

export const validateEnvironmentVariables = <
  T extends ReturnType<typeof z.object>,
  K
>(
  schema: T,
  unparsedEnv: K
) => {
  const env = schema.safeParse(unparsedEnv);

  if (!env.success) {
    console.error(
      "❌ Invalid environment variables:\n",
      formatZodErrors(env.error.format())
    );
    throw new Error("Invalid environment variables");
  }
};
