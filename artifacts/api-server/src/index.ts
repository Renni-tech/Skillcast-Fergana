import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// HOST is optional: `pnpm dev` sets 127.0.0.1 locally; Replit leaves it unset
// (listen on all interfaces, as before).
const host = process.env["HOST"];

const onListen = (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port, host: host ?? "all interfaces" }, "Server listening");
};

if (host) app.listen(port, host, onListen);
else app.listen(port, onListen);
