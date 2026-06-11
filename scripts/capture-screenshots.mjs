#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "docs/assets/screenshots");
const port = 8766;
const chromeDebugPort = 9227;

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".png", "image/png"],
]);

function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  return candidates[0];
}

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

async function removeWithRetry(path) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await rm(path, { recursive: true, force: true });
      return;
    } catch (error) {
      if (attempt === 4) throw error;
      await wait(250);
    }
  }
}

function startServer() {
  const server = createServer((request, response) => {
    const url = new URL(request.url || "/", `http://127.0.0.1:${port}`);
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = resolve(root, `.${pathname}`);
    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    response.setHeader("Content-Type", mimeTypes.get(extname(filePath)) || "application/octet-stream");
    createReadStream(filePath)
      .on("error", () => {
        response.writeHead(404);
        response.end("Not found");
      })
      .pipe(response);
  });
  return new Promise((resolveServer) => {
    server.listen(port, "127.0.0.1", () => resolveServer(server));
  });
}

async function getWebSocketUrl() {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${chromeDebugPort}/json/list`);
      if (response.ok) {
        const data = await response.json();
        const page = data.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
        if (page) return page.webSocketDebuggerUrl;
      }
    } catch {
      await wait(250);
    }
  }
  throw new Error("Chrome DevTools endpoint did not become available.");
}

function createCdpClient(wsUrl) {
  const socket = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  const events = new Map();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolveMessage, rejectMessage } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) rejectMessage(new Error(message.error.message));
      else resolveMessage(message.result || {});
      return;
    }
    if (message.method && events.has(message.method)) {
      for (const resolveEvent of events.get(message.method)) resolveEvent(message.params || {});
      events.delete(message.method);
    }
  });

  const ready = new Promise((resolveReady, rejectReady) => {
    socket.addEventListener("open", resolveReady, { once: true });
    socket.addEventListener("error", rejectReady, { once: true });
  });

  function send(method, params = {}) {
    const id = nextId++;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolveMessage, rejectMessage) => {
      pending.set(id, { resolveMessage, rejectMessage });
      socket.send(payload);
    });
  }

  function once(method) {
    return new Promise((resolveEvent) => {
      const listeners = events.get(method) || [];
      listeners.push(resolveEvent);
      events.set(method, listeners);
    });
  }

  return {
    ready,
    send,
    once,
    close: () => socket.close(),
  };
}

async function capture(client, filename, scrollExpression) {
  await client.send("Runtime.evaluate", { expression: scrollExpression, awaitPromise: false });
  await wait(500);
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  await writeFile(join(outDir, filename), Buffer.from(result.data, "base64"));
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const server = await startServer();
  const profileDir = join(tmpdir(), `smb-financial-tracker-chrome-${Date.now()}`);
  const chrome = spawn(chromePath(), [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${chromeDebugPort}`,
    `--user-data-dir=${profileDir}`,
    "--window-size=1440,1100",
    `http://127.0.0.1:${port}/index.html`,
  ], { stdio: "ignore" });

  try {
    const wsUrl = await getWebSocketUrl();
    const client = createCdpClient(wsUrl);
    await client.ready;
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1100,
      deviceScaleFactor: 1,
      mobile: false,
    });
    const loaded = client.once("Page.loadEventFired");
    await client.send("Page.navigate", { url: `http://127.0.0.1:${port}/index.html` });
    await loaded;
    await wait(1000);

    await capture(client, "dashboard-overview.png", "window.scrollTo(0, 0)");
    await capture(client, "action-center.png", "document.getElementById('copyAgentBrief').closest('section').scrollIntoView()");
    await capture(client, "ledger-review.png", "document.querySelector('.ledger').closest('section').scrollIntoView()");
    await capture(client, "accountant-export.png", "document.getElementById('summaryText').closest('section').scrollIntoView()");
    client.close();
  } finally {
    chrome.kill("SIGTERM");
    await wait(750);
    server.close();
    await removeWithRetry(profileDir);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
