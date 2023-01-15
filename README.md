<h3 align="center">Next-ValidEnv</h3>
<p align="center">Typesafe environment variables for Next.js</p>
<p align="center">
    <a href="https://packagephobia.com/result?p=next-validenv">
        <img src="https://packagephobia.com/badge?p=next-validenv" alt="Bundle Size" />
    </a>
    <a href="https://www.npmtrends.com/next-validenv">
        <img src="https://img.shields.io/npm/dm/next-validenv" alt="Downloads" />
    </a>
    <a href="https://github.com/jacobadevore/next-validenv/stargazers">
        <img src="https://img.shields.io/github/stars/jacobadevore/next-validenv" alt="Github Stars" />
    </a>
    <a href="https://www.npmjs.com/package/next-validenv">
        <img src="https://img.shields.io/github/v/release/jacobadevore/next-validenv?label=latest"
            alt="Github Stable Release" />
    </a>
</p>
<p align="center">Created by</p>
<div align="center">
    <td align="center"><a href="https://twitter.com/JacobADevore"><img
                src="https://avatars.githubusercontent.com/u/20541754?v=4?s=100" width="100px;"
                alt="" /><br /><sub><b>Jacob Devore</b></sub></a></td>
</div>

---

### Installation

```sh
npm install zod next-validenv

yarn add zod next-validenv
```

```sh
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint typescript

yarn add --dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint typescript
```

### First, modify `.eslintrc.json`

Append `"extends"` with `"plugin:@typescript-eslint/recommended"`

```js
{
  "extends": ["plugin:@typescript-eslint/recommended"]
}
```

### Create `env.mjs`

Where your server and client schemas live for typesafe environment variables

```js
//@ts-check
import { validateEnvironmentVariables } from "next-validenv";
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  // NEXT_PUBLIC_TEST: z.string(),
});

export const env = validateEnvironmentVariables(serverSchema, clientSchema);
```

### Update ~~`next.config.js`~~ to `next.config.mjs`

```js
// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
};
export default config;
```

### Create `environment.d.ts`

```js
import { env } from "./env.mjs";

type EnvType = typeof env;

export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvType, NodeJS.ProcessEnv {}
  }
}
```

### That's it! Now you can use `process.env` and get typesafe environment variables

```js
process.env.NODE_ENV; // Typesafe environment variables
```

---

## Manual Implementation

Follow the below guide to manually implement typesafe environment variables in Next.js without installing the Next-ValidEnv library

### Installation

```sh
npm install zod

yarn add zod
```

```sh
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint typescript

yarn add --dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint typescript
```

### First, modify `.eslintrc.json`

Append `"extends"` with `"plugin:@typescript-eslint/recommended"`

```js
{
  "extends": ["plugin:@typescript-eslint/recommended"]
}
```

### Create `env.mjs`

Where your server and client schemas live for typesafe environment variables

```js
// @ts-check
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  // NEXT_PUBLIC_TEST: z.string(),
});

/**
 * --------------------------------
 * --------------------------------
 * DON'T TOUCH ANYTHING BELOW THIS LINE (UNLESS YOU KNOW WHAT YOU'RE DOING)
 * --------------------------------
 * --------------------------------
 */

// maps through zod schema keys and returns an object with the safeParse values from process.env[key]
export const mapEnvironmentVariablesToObject = (
  /** @type {ReturnType<typeof z.object>} */ schema
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

export const formatErrors = (/** @type {(string | undefined)[]} */ errors) =>
  errors.map((name) => `${name}\n`);

/**
 * @function
 * @template {ReturnType<typeof z.object>} T
 * @template {ReturnType<typeof z.object>} K
 * @param {T} serverSchema
 * @param {K} clientSchema
 * @returns {z.infer<T> & z.infer<K>}
 */
export const validateEnvironmentVariables = (serverSchema, clientSchema) => {
  let serverEnv = mapEnvironmentVariablesToObject(serverSchema);
  let clientEnv = mapEnvironmentVariablesToObject(clientSchema);

  // holds not set environment variable errors for both client and server
  /** @type {(string | undefined)[]} */ let invalidEnvErrors = [];

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
  /** @type {(string | undefined)[]} */ let exposedServerEnvErrors = [];

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
  /** @type {(string | undefined)[]} */ let notExposedClientEnvErrors = [];

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

export const env = validateEnvironmentVariables(serverSchema, clientSchema);
```

### Update ~~`next.config.js`~~ to `next.config.mjs`

```js
// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
};
export default config;
```

### Create `environment.d.ts`

```js
import { env } from "./env.mjs";

type EnvType = typeof env;

export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvType, NodeJS.ProcessEnv {}
  }
}
```

### That's it! Now you can use `process.env` and get typesafe environment variables

```js
process.env.NODE_ENV; // Typesafe environment variables
```
