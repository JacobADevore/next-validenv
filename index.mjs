// @ts-check

export const mapProcessEnvToObject = (
  /** @type {import('zod').ZodObject} */ schema
) => {
  /** @type {{ [key: string]: string | undefined; }} */
  let env = {};

  Object.keys(schema.shape).forEach((key) => (env[key] = process.env[key]));

  return schema.safeParse(env);
};

export const formatZodErrors = (
  /** @type {import('zod').ZodFormattedError<Map<string,string>,string>} */ errors
) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value)
        return `${name}: ${value._errors.join(", ")}\n`;
    })
    .filter(Boolean);

export const formatErrors = (/** @type string[]} */ errors) =>
  errors.map((name) => `${name}\n`);

export const validateEnvironmentVariables = (
  /** @type {import('zod').ZodObject} */ clientSchema,
  /** @type {import('zod').ZodObject} */ serverSchema
) => {
  let serverEnv = mapProcessEnvToObject(serverSchema);
  let clientEnv = mapProcessEnvToObject(clientSchema);

  let invalidEnvErrors = [];

  if (!serverEnv.success) {
    invalidEnvErrors = [
      ...invalidEnvErrors,
      ...formatZodErrors(serverEnv.error.format()),
    ];
  }

  if (!clientEnv.success) {
    invalidEnvErrors = [
      ...invalidEnvErrors,
      ...formatZodErrors(clientEnv.error.format()),
    ];
  }

  if (!serverEnv.success || !clientEnv.success) {
    console.error("❌ Invalid environment variables:\n", ...invalidEnvErrors);
    throw new Error("Invalid environment variables");
  }

  let exposedServerEnvErrors = [];

  for (let key of Object.keys(serverEnv.data)) {
    if (key.startsWith("NEXT_PUBLIC_")) {
      exposedServerEnvErrors = [...exposedServerEnvErrors, key];
    }
  }

  if (exposedServerEnvErrors.length > 0) {
    console.error(
      "❌ You are exposing the following server-side environment variables to the client:\n",
      ...formatErrors(exposedServerEnvErrors)
    );
    throw new Error(
      "You are exposing the following server-side environment variables to the client"
    );
  }

  let notExposedClientEnvErrors = [];

  for (let key of Object.keys(clientEnv.data)) {
    if (!key.startsWith("NEXT_PUBLIC_")) {
      notExposedClientEnvErrors = [...notExposedClientEnvErrors, key];
    }
  }

  if (notExposedClientEnvErrors.length > 0) {
    console.error(
      "❌ All client-side environment variables must begin with 'NEXT_PUBLIC_', you are not exposing the following:\n",
      ...formatErrors(notExposedClientEnvErrors)
    );
    throw new Error(
      "All client-side environment variables must begin with 'NEXT_PUBLIC_', you are not exposing the following:"
    );
  }

  return { ...serverEnv.data, ...clientEnv.data };
};
