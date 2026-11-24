// Vercel Function entry: the same Express app as the long-running server
// (src/index.ts), exported as a Node request handler instead of listening on a
// port. Bundled by scripts/build-vercel.mjs into .vercel/output/functions/.
import app from "./app";

export default app;
