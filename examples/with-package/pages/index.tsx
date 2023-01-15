import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>
          Typesafe environment variables for Next.js - Next-ValidEnv
        </title>
        <meta
          name="description"
          content="Typesafe environment variables for Next.js"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-6 text-center space-y-12 pt-12">
        <div className="flex flex-col space-y-3">
          <h1 className="text-5xl font-medium">Next-ValidEnv</h1>
          <p className="text-xl text-neutral-400">
            Typesafe environment variables for Next.js
          </p>
          <div className="flex flex-row space-x-6 items-center justify-center pt-3">
            <a
              href="https://github.com/JacobADevore/next-validenv"
              target="_blank"
              className="text-blue-400 hover:underline"
            >
              View Code
            </a>
            <a
              href="https://twitter.com/JacobADevore"
              target="_blank"
              className="text-blue-400 hover:underline"
            >
              Twitter
            </a>
          </div>
        </div>

        <div className="bg-neutral-600 h-px w-full" />

        <div className="flex flex-col space-y-3 text-neutral-400 text-xl">
          <p>
            By default environment variables are only available in the Node.js
            environment, meaning they won't be exposed to the browser.
          </p>
          <p>
            In order to expose a variable to the browser you have to prefix the
            variable with{" "}
            <span className="px-3 py-1 rounded bg-neutral-800 mx-1">
              NEXT_PUBLIC_
            </span>
            . For example:
          </p>
        </div>

        <div className="bg-neutral-600 h-px w-full" />

        <p className="text-xl">Typesafe environment variables:</p>

        <p className="text-green-400">{process.env.NEXT_PUBLIC_TEST}</p>
      </main>
    </>
  );
}
