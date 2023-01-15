import { env } from "./env.mjs";

type EnvType = typeof env;

export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvType, NodeJS.ProcessEnv {}
  }
}
