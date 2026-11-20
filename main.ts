// Leonida Trophy Guide — main.ts
// Project entrypoint. Starts the static server for the app/ folder using
// only Node.js runtime built-ins and keeps it running until interrupted.
//
//   node main.ts             -> http://localhost:8080
//   PORT=3000 node main.ts   -> http://localhost:3000
//
// serve.ts is an alternative, leaner entrypoint for the same job.

import { createServer, type Server, type IncomingMessage, type ServerResponse } from "node:http";
import { createReadStream } from "node:fs";
import { statSync } from "node:fs";
import { extname, join, resolve, sep, dirname } from "node:path";
import { fileURLToPath } from "node:url";

interface GuideConfig {
  port: number;
  rootDir: string;
}

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function loadConfig(): GuideConfig {
  const here = dirname(fileURLToPath(import.meta.url));
  const port = Number.parseInt(process.env.PORT ?? "8080", 10);
  return {
    port: Number.isFinite(port) && port > 0 ? port : 8080,
    rootDir: join(here, "app"),
  };
}

/** Turn a request path into an absolute file path, refusing escapes. */
function toFilePath(rootDir: string, requestPath: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(requestPath);
  } catch {
    return null;
  }
  const candidate = resolve(rootDir, "." + decoded);
  if (candidate !== rootDir && !candidate.startsWith(rootDir + sep)) return null;
  return candidate;
}

function replyText(res: ServerResponse, status: number, text: string): void {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function handleRequest(rootDir: string, req: IncomingMessage, res: ServerResponse): void {
  if (req.method !== "GET" && req.method !== "HEAD") {
    replyText(res, 405, "Method not allowed.");
    return;
  }

  const url = new URL(req.url ?? "/", "http://localhost");
  let filePath = toFilePath(rootDir, url.pathname);
  if (filePath === null) {
    replyText(res, 400, "Bad request path.");
    return;
  }

  let stats = null as ReturnType<typeof statSync> | null;
  try {
    stats = statSync(filePath);
    if (stats.isDirectory()) {
      filePath = join(filePath, "index.html");
      stats = statSync(filePath);
    }
  } catch {
    stats = null;
  }
  if (stats === null || !stats.isFile() || filePath === null) {
    replyText(res, 404, "Not found: " + url.pathname);
    return;
  }

  const type = CONTENT_TYPES[extname(filePath).toLowerCase()] ?? "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": stats.size,
    "Cache-Control": "no-cache",
  });
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  createReadStream(filePath).pipe(res);
}

function createGuideServer(config: GuideConfig): Server {
  return createServer((req, res) => handleRequest(config.rootDir, req, res));
}

function main(): void {
  const config = loadConfig();
  const server = createGuideServer(config);

  server.on("error", (err: Error) => {
    console.error("Leonida Trophy Guide failed to start: " + err.message);
    process.exitCode = 1;
  });

  server.listen(config.port, () => {
    console.log("Leonida Trophy Guide is live at http://localhost:" + config.port);
    console.log("Serving " + config.rootDir + " — press Ctrl-C to stop.");
  });

  const shutdown = (): void => {
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();
