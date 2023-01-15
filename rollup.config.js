// rollup.config.js
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "index.ts",
    output: [
      {
        file: "dist/index.mjs",
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        tsconfig: "tsconfig.json",
        sourceMap: true,
      }),
    ],
  },
];
