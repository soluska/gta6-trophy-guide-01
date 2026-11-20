// Leonida Trophy Guide — serve.ts
// A small static file server for the app/ folder, written from scratch on
// Node.js runtime built-ins only (no dependencies).
//
//   node serve.ts            -> http://localhost:8080
//   PORT=3000 node serve.ts  -> http://localhost:3000

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PORT: number = Number(process.env.PORT ?? "8080");
const ROOT: string = join(dirname(fileURLToPath(import.meta.url)), "app");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

/** Map a request URL to a file inside ROOT, or null if it escapes ROOT. */
function resolvePath(urlPath: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const relative = normalize(decoded).replace(/^[/\\]+/, "");
  const full = join(ROOT, relative);
  if (full !== ROOT && !full.startsWith(ROOT + "/")) return null;
  return full;
}

async function sendFile(res: import("node:http").ServerResponse, filePath: string): Promise<void> {
  const body = await readFile(filePath);
  const type = MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream";
  res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    let filePath = resolvePath(url.pathname);
    if (filePath === null) {
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Bad request path.");
      return;
    }
    let info = await stat(filePath).catch(() => null);
    if (info !== null && info.isDirectory()) {
      filePath = join(filePath, "index.html");
      info = await stat(filePath).catch(() => null);
    }
    if (info === null || !info.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found: " + url.pathname);
      return;
    }
    await sendFile(res, filePath);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Server error: " + (err instanceof Error ? err.message : String(err)));
  }
});

server.listen(PORT, () => {
  console.log("Leonida Trophy Guide serving app/ at http://localhost:" + PORT);
});
