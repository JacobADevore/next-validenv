// @ts-check

// maps through zod schema keys and returns an object with the safeParse values from process.env[key]
export const mapEnvironmentVariablesToObject = (
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
  let serverEnv = mapEnvironmentVariablesToObject(serverSchema);
  let clientEnv = mapEnvironmentVariablesToObject(clientSchema);

  // holds not set environment variable errors for both client and server
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

  // if one or more environment variables are not set, throw an error
  if (!serverEnv.success || !clientEnv.success) {
    console.error("❌ Invalid environment variables:\n", ...invalidEnvErrors);
    throw new Error("Invalid environment variables");
  }

  // holds server environment variables errors that are exposed to the client
  let exposedServerEnvErrors = [];

  for (let key of Object.keys(serverEnv.data)) {
    if (key.startsWith("NEXT_PUBLIC_")) {
      exposedServerEnvErrors = [...exposedServerEnvErrors, key];
    }
  }

  // if one or more server environment variables are exposed to the client, throw an error
  if (exposedServerEnvErrors.length > 0) {
    console.error(
      "❌ You are exposing the following server-side environment variables to the client:\n",
      ...formatErrors(exposedServerEnvErrors)
    );
    throw new Error(
      "You are exposing the following server-side environment variables to the client"
    );
  }

  // holds client environment variables errors that are not exposed to the client
  let notExposedClientEnvErrors = [];

  for (let key of Object.keys(clientEnv.data)) {
    if (!key.startsWith("NEXT_PUBLIC_")) {
      notExposedClientEnvErrors = [...notExposedClientEnvErrors, key];
    }
  }

  // if one or more client environment variables are not exposed to the client, throw an error
  if (notExposedClientEnvErrors.length > 0) {
    console.error(
      "❌ All client-side environment variables must begin with 'NEXT_PUBLIC_', you are not exposing the following:\n",
      ...formatErrors(notExposedClientEnvErrors)
    );
    throw new Error(
      "All client-side environment variables must begin with 'NEXT_PUBLIC_', you are not exposing the following:"
    );
  }

  // return both client and server environment variables
  return { ...serverEnv.data, ...clientEnv.data };
};
