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
 * Specify your environment variables schema here.
 * This way, you can ensure the app isn't built with invalid environment variables.
 * By default, environment variables are only available in the Node.js environment, meaning they won't be exposed to the browser. In order to expose a variable to the browser you have to prefix the variable with NEXT_PUBLIC_.
 * -> Don't use any Zod .transform() methods in the schema (will cause `implicitly has type 'any'` error) <-
 */
export const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
});

/**
 * Environment variable declarations based on the schema help structure your environment variables programmatically.
 * @type {{ [k in keyof z.infer<typeof schema>]: z.infer<typeof schema>[k] | undefined }}
 */
export const env = {
  NODE_ENV: process.env.NODE_ENV,
};

validateEnvironmentVariables(schema, env);
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

### Create `env.d.ts`

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
 * Specify your environment variables schema here.
 * This way, you can ensure the app isn't built with invalid environment variables.
 * By default, environment variables are only available in the Node.js environment, meaning they won't be exposed to the browser. In order to expose a variable to the browser you have to prefix the variable with NEXT_PUBLIC_.
 * -> Don't use any Zod .transform() methods in the schema (will cause `implicitly has type 'any'` error) <-
 */
export const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
});

/**
 * Environment variable declarations based on the schema help structure your environment variables programmatically.
 * @type {{ [k in keyof z.infer<typeof schema>]: z.infer<typeof schema>[k] | undefined }}
 */
export const env = {
  NODE_ENV: process.env.NODE_ENV,
};

/**
 * --------------------------------
 * --------------------------------
 * Next-ValidEnv Manual Implementation
 * --------------------------------
 * --------------------------------
 */

export const formatZodErrors = (
  /** @type z.ZodFormattedError<Map<string, string>, string> */ errors
) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value)
        return `${name}: ${value._errors.join(", ")}\n`;

      return;
    })
    .filter(Boolean);

const safeParsedEnv = schema.safeParse(env);

if (!safeParsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:\n",
    ...formatZodErrors(safeParsedEnv.error.format())
  );
  throw new Error("Invalid environment variables");
}
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

### Create `env.d.ts`

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
