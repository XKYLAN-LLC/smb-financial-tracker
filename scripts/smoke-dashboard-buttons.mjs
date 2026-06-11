#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { delimiter, extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";

const root = resolve(new URL("..", import.meta.url).pathname);
const port = Number(process.env.SMOKE_PORT || 8767);
const chromeDebugPort = Number(process.env.SMOKE_CHROME_DEBUG_PORT || 9228);

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
]);

function chromePath() {
  if (process.env.CHROME_PATH) {
    if (existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
    throw new Error(`CHROME_PATH does not exist: ${process.env.CHROME_PATH}`);
  }
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  const match = candidates.find((candidate) => existsSync(candidate));
  if (match) return match;
  const names = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"];
  for (const dir of (process.env.PATH || "").split(delimiter)) {
    for (const name of names) {
      const candidate = join(dir, name);
      if (existsSync(candidate)) return candidate;
    }
  }
  throw new Error("Chrome or Chromium was not found. Set CHROME_PATH to a browser executable.");
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
  return new Promise((resolveServer, rejectServer) => {
    server.once("error", rejectServer);
    server.listen(port, "127.0.0.1", () => {
      server.off("error", rejectServer);
      resolveServer(server);
    });
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
  const onceEvents = new Map();
  const handlers = new Map();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolveMessage, rejectMessage } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) rejectMessage(new Error(message.error.message));
      else resolveMessage(message.result || {});
      return;
    }
    if (!message.method) return;
    if (handlers.has(message.method)) {
      for (const handler of handlers.get(message.method)) handler(message.params || {});
    }
    if (onceEvents.has(message.method)) {
      for (const resolveEvent of onceEvents.get(message.method)) resolveEvent(message.params || {});
      onceEvents.delete(message.method);
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
      const listeners = onceEvents.get(method) || [];
      listeners.push(resolveEvent);
      onceEvents.set(method, listeners);
    });
  }

  function on(method, handler) {
    const listeners = handlers.get(method) || [];
    listeners.push(handler);
    handlers.set(method, listeners);
  }

  return {
    ready,
    send,
    once,
    on,
    close: () => socket.close(),
  };
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  });
  if (result.exceptionDetails) {
    const details = result.exceptionDetails.exception?.description || result.exceptionDetails.text;
    throw new Error(details || "Runtime evaluation failed.");
  }
  return result.result?.value;
}

async function click(client, selector) {
  const selectorLiteral = JSON.stringify(selector);
  return evaluate(client, `
    (() => {
      const element = document.querySelector(${selectorLiteral});
      if (!element) throw new Error("Missing selector: " + ${selectorLiteral});
      element.scrollIntoView({ block: "center", inline: "center" });
      element.click();
      return true;
    })()
  `);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function assertPageReady(client) {
  const result = await evaluate(client, `
    (() => ({
      title: document.title,
      h1: document.querySelector("h1")?.textContent,
      rowCount: document.querySelectorAll("#ledgerBody tr").length,
      buttonCount: document.querySelectorAll("button").length,
      internalLinksMissingTargets: Array.from(document.querySelectorAll('a[href^="#"]'))
        .map((link) => link.getAttribute("href"))
        .filter((href) => href !== "#" && !document.querySelector(href)),
      missingCoreButtons: [
        "copyAgentBrief",
        "copyManifestStarter",
        "addRow",
        "saveState",
        "exportBackup",
        "resetState",
        "exportCsv",
        "exportMarkdown",
        "copySummary",
        "printView"
      ].filter((id) => !document.getElementById(id)),
      disabledCoreButtons: [
        "copyAgentBrief",
        "copyManifestStarter",
        "addRow",
        "saveState",
        "exportBackup",
        "resetState",
        "exportCsv",
        "exportMarkdown",
        "copySummary",
        "printView"
      ].filter((id) => document.getElementById(id)?.disabled)
    }))()
  `);
  assert(result.title === "Local Financial Tracker", "Dashboard title did not load.");
  assert(result.h1 === "Local Financial Tracker", "Dashboard heading did not load.");
  assert(result.rowCount > 0, "Ledger rows did not render.");
  assert(result.buttonCount >= 10, "Expected dashboard buttons did not render.");
  assert(result.internalLinksMissingTargets.length === 0, `Internal links missing targets: ${result.internalLinksMissingTargets.join(", ")}`);
  assert(result.missingCoreButtons.length === 0, `Missing core buttons: ${result.missingCoreButtons.join(", ")}`);
  assert(result.disabledCoreButtons.length === 0, `Unexpected disabled core buttons: ${result.disabledCoreButtons.join(", ")}`);
  return result;
}

async function installSpies(client) {
  await evaluate(client, `
    (() => {
      window.__smoke = {
        downloads: [],
        printed: false,
        confirms: [],
        confirmQueue: [],
        alerts: []
      };
      window.alert = (message) => window.__smoke.alerts.push(String(message));
      window.confirm = (message) => {
        window.__smoke.confirms.push(String(message));
        return window.__smoke.confirmQueue.length ? window.__smoke.confirmQueue.shift() : true;
      };
      window.print = () => {
        window.__smoke.printed = true;
      };
      const originalAnchorClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function smokeDownloadClick() {
        if (this.download) {
          window.__smoke.downloads.push({
            download: this.download || "",
            href: this.href || ""
          });
          return;
        }
        return originalAnchorClick.call(this);
      };
      return true;
    })()
  `);
}

async function verifyActionButtons(client) {
  for (const status of ["Needs support", "CPA review", "Estimate"]) {
    await click(client, `[data-filter-status="${status}"]`);
    const selected = await evaluate(client, `document.getElementById("filterStatus").value`);
    assert(selected === status, `Quick filter did not select ${status}.`);
  }

  await click(client, "#copyAgentBrief");
  await wait(100);
  let label = await evaluate(client, `document.getElementById("copyAgentBrief").textContent`);
  assert(label === "Copied", "Copy Agent Brief button did not confirm copy.");
  await wait(1050);

  await click(client, "#copyManifestStarter");
  await wait(100);
  label = await evaluate(client, `document.getElementById("copyManifestStarter").textContent`);
  assert(label === "Copied", "Copy Source Manifest Starter button did not confirm copy.");
  await wait(1050);
}

async function verifyLedgerButtons(client, baselineRows) {
  await evaluate(client, `
    (() => {
      filters.status = "";
      filters.type = "";
      filters.search = "";
      filters.includedOnly = false;
      document.getElementById("searchRows").value = "";
      document.getElementById("includedOnly").checked = false;
      renderFilterOptions();
      renderLedger();
      return true;
    })()
  `);

  await click(client, "#addRow");
  let rowCount = await evaluate(client, `state.rows.length`);
  assert(rowCount === baselineRows + 1, "Add Row did not append a ledger row.");

  await click(client, "#saveState");
  const savedRows = await evaluate(client, `JSON.parse(localStorage.getItem(storageKey)).rows.length`);
  assert(savedRows === rowCount, "Save did not persist the current row count.");

  await click(client, "#exportBackup");
  await click(client, "#exportCsv");
  await click(client, "#exportMarkdown");
  let downloads = await evaluate(client, `window.__smoke.downloads.map((item) => item.download)`);
  for (const filename of [
    "local-financial-tracker-backup.json",
    "local-financial-tracker-cpa-export.csv",
    "local-financial-tracker-accountant-export.md"
  ]) {
    assert(downloads.includes(filename), `${filename} download was not requested.`);
  }

  await click(client, "#copySummary");
  await wait(100);
  const copySummaryLabel = await evaluate(client, `document.getElementById("copySummary").textContent`);
  assert(copySummaryLabel === "Copied", "Copy Summary button did not confirm copy.");
  await wait(1050);

  await click(client, "#printView");
  const printed = await evaluate(client, `window.__smoke.printed`);
  assert(printed === true, "Print / Save PDF did not call print.");

  await click(client, '#ledgerBody button[data-action="delete"]');
  rowCount = await evaluate(client, `state.rows.length`);
  assert(rowCount === baselineRows, "Remove row button did not delete one row.");
}

async function verifyImportsAndReset(client, baselineRows) {
  await evaluate(client, `
    (async () => {
      const input = document.getElementById("importBackup");
      const file = new File(["not json"], "bad-backup.json", { type: "application/json" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      Object.defineProperty(input, "files", { value: dataTransfer.files, configurable: true });
      input.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 250));
      return true;
    })()
  `);
  let alerts = await evaluate(client, `window.__smoke.alerts.slice()`);
  assert(alerts.some((message) => message.includes("Could not import backup")), "Invalid backup import did not show an alert.");
  let rowCount = await evaluate(client, `state.rows.length`);
  assert(rowCount === baselineRows, "Invalid backup import changed state.");
  await evaluate(client, `window.__smoke.alerts = []`);

  await evaluate(client, `
    (async () => {
      const input = document.getElementById("importMonarch");
      const csv = [
        "Date,Merchant,Category,Amount,Notes,Tags,Business Entity,Original Statement",
        "2026-06-02,Personal Tool,Software,-12.34,Synthetic no-match import,,Personal,Smoke statement"
      ].join("\\n");
      const file = new File([csv], "smoke-no-match.csv", { type: "text/csv" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      Object.defineProperty(input, "files", { value: dataTransfer.files, configurable: true });
      input.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 250));
      return true;
    })()
  `);
  alerts = await evaluate(client, `window.__smoke.alerts.slice()`);
  assert(alerts.some((message) => message.includes("No matching rows")), "No-match Monarch CSV did not show an alert.");
  rowCount = await evaluate(client, `state.rows.length`);
  assert(rowCount === baselineRows, "No-match Monarch CSV changed state.");
  await evaluate(client, `window.__smoke.alerts = []`);

  await evaluate(client, `
    (async () => {
      window.__smoke.confirmQueue.push(false);
      const input = document.getElementById("importMonarch");
      const csv = [
        "Date,Merchant,Category,Amount,Notes,Tags,Business Entity,Original Statement",
        "2026-06-02,Smoke Cancel Tool,Software,-12.34,Synthetic canceled import,,Sample Business LLC,Smoke statement"
      ].join("\\n");
      const file = new File([csv], "smoke-cancel.csv", { type: "text/csv" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      Object.defineProperty(input, "files", { value: dataTransfer.files, configurable: true });
      input.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 250));
      return state.rows.length;
    })()
  `);
  rowCount = await evaluate(client, `state.rows.length`);
  assert(rowCount === baselineRows, "Canceled Monarch import changed state.");

  await evaluate(client, `
    (async () => {
      const input = document.getElementById("importMonarch");
      const csv = [
        "Date,Merchant,Category,Amount,Notes,Tags,Business Entity,Original Statement",
        "2026-06-02,Smoke Test Tool,Software,-12.34,Synthetic smoke import,,Sample Business LLC,Smoke statement"
      ].join("\\n");
      const file = new File([csv], "smoke-monarch.csv", { type: "text/csv" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      Object.defineProperty(input, "files", { value: dataTransfer.files, configurable: true });
      input.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 250));
      return state.rows.length;
    })()
  `);
  rowCount = await evaluate(client, `state.rows.length`);
  assert(rowCount === baselineRows + 1, "Import Monarch CSV did not append a synthetic row.");
  const importedDescription = await evaluate(client, `state.rows.some((row) => row.description === "Smoke Test Tool")`);
  assert(importedDescription === true, "Imported Monarch row was not found.");

  const backupRowCount = await evaluate(client, `
    (async () => {
      const input = document.getElementById("importBackup");
      const backup = {
        schemaVersion: "0.1.0",
        profile: {
          workspace: "Smoke backup workspace",
          privacy: "Synthetic smoke data."
        },
        settings: {
          threshold: 22025,
          coveredCaProjected: 18420,
          coveredCaNext12: 18420,
          reviewDate: "2026-06-01",
          programId: "covered-ca-medi-cal-ca-2026-hh1"
        },
        rows: [{
          id: "smoke-backup-row",
          use: true,
          date: "2026-06-01",
          type: "Revenue",
          description: "Smoke backup revenue",
          amount: 1,
          bucket: "Gross receipts",
          subcategory: "Smoke",
          businessPct: 100,
          status: "Supported",
          notes: "Synthetic smoke backup row."
        }]
      };
      const file = new File([JSON.stringify(backup)], "smoke-backup.json", { type: "application/json" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      Object.defineProperty(input, "files", { value: dataTransfer.files, configurable: true });
      input.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 250));
      return state.rows.length;
    })()
  `);
  assert(backupRowCount === 1, "Import Backup did not replace state with backup rows.");
  const workspaceName = await evaluate(client, `document.getElementById("workspaceName").textContent`);
  assert(workspaceName === "Smoke backup workspace", "Import Backup did not update the workspace name.");

  await evaluate(client, `window.__smoke.confirmQueue.push(false)`);
  await click(client, "#resetState");
  rowCount = await evaluate(client, `state.rows.length`);
  assert(rowCount === 1, "Canceled reset changed state.");

  await click(client, "#resetState");
  await wait(500);
  rowCount = await evaluate(client, `state.rows.length`);
  assert(rowCount === baselineRows, "Reset did not restore the seeded baseline row count.");
  const confirms = await evaluate(client, `window.__smoke.confirms.length`);
  assert(confirms >= 4, "Expected confirm prompts for CSV import/cancel and reset/cancel.");
}

async function verifyNavigation(client) {
  const anchors = await evaluate(client, `
    (() => Array.from(document.querySelectorAll('a[href^="#"]')).map((link) => ({
      text: link.textContent.trim(),
      href: link.getAttribute("href"),
      exists: !!document.querySelector(link.getAttribute("href"))
    })))()
  `);
  assert(anchors.every((anchor) => anchor.exists), "One or more internal navigation targets is missing.");

  await click(client, '.topbar a[href="#ledger"]');
  let hash = await evaluate(client, `location.hash`);
  assert(hash === "#ledger", "Open Ledger link did not navigate to the ledger.");

  await click(client, '.topbar a[href="#accountant-package"]');
  hash = await evaluate(client, `location.hash`);
  assert(hash === "#accountant-package", "Export Package link did not navigate to accountant package.");

  const internalNav = await evaluate(client, `
    (() => Array.from(document.querySelectorAll('.sidebar a[href^="#"]')).map((link) => link.getAttribute("href")))()
  `);
  for (const href of [...new Set(internalNav)]) {
    await click(client, `.sidebar a[href="${href}"]`);
    hash = await evaluate(client, `location.hash`);
    assert(hash === href, `Sidebar link did not navigate to ${href}.`);
  }

  const localLinks = await evaluate(client, `
    (async () => {
      const links = Array.from(document.querySelectorAll('a[href]:not([href^="#"]):not([href^="http"])'))
        .map((link) => link.getAttribute("href"));
      const results = [];
      for (const href of links) {
        const response = await fetch(href, { cache: "no-store" });
        results.push({ href, ok: response.ok, status: response.status });
      }
      return results;
    })()
  `);
  const brokenLocalLinks = localLinks.filter((link) => !link.ok);
  assert(brokenLocalLinks.length === 0, `Local docs links failed: ${JSON.stringify(brokenLocalLinks)}`);
}

async function verifyFiltersAndSettings(client) {
  const filterResult = await evaluate(client, `
    (() => {
      const visibleCount = () => Array.from(document.querySelectorAll("#ledgerBody tr"))
        .filter((row) => row.querySelector("[data-field]")).length;
      filters.search = "";
      filters.type = "";
      filters.status = "";
      filters.includedOnly = false;
      document.getElementById("searchRows").value = "";
      document.getElementById("includedOnly").checked = false;
      renderFilterOptions();
      renderLedger();

      const search = document.getElementById("searchRows");
      search.value = "software";
      search.dispatchEvent(new Event("input", { bubbles: true }));
      const searchRows = visibleCount();
      const searchMatches = filteredRows().every(({ row }) => [row.date, row.type, row.description, row.bucket, row.subcategory, row.status, row.notes].join(" ").toLowerCase().includes("software"));

      const type = document.getElementById("filterType");
      type.value = "Expense";
      type.dispatchEvent(new Event("change", { bubbles: true }));
      const expenseCount = visibleCount();
      const expectedExpenseCount = state.rows.filter((row) => row.type === "Expense" && [row.date, row.type, row.description, row.bucket, row.subcategory, row.status, row.notes].join(" ").toLowerCase().includes("software")).length;

      search.value = "";
      search.dispatchEvent(new Event("input", { bubbles: true }));
      const status = document.getElementById("filterStatus");
      status.value = "Needs support";
      status.dispatchEvent(new Event("change", { bubbles: true }));
      const needsSupportCount = visibleCount();
      const expectedNeedsSupportCount = state.rows.filter((row) => row.type === "Expense" && row.status === "Needs support").length;

      const includedOnly = document.getElementById("includedOnly");
      includedOnly.checked = true;
      includedOnly.dispatchEvent(new Event("change", { bubbles: true }));
      const includedOnlyCount = visibleCount();
      const expectedIncludedOnlyCount = state.rows.filter((row) => row.type === "Expense" && row.status === "Needs support" && row.use && row.status !== "Exclude").length;

      includedOnly.checked = false;
      includedOnly.dispatchEvent(new Event("change", { bubbles: true }));
      const staleFilterBefore = visibleCount();
      const firstStatusSelect = document.querySelector('#ledgerBody select[data-field="status"]');
      const editedRowDescription = firstStatusSelect?.closest("tr")?.querySelector('[data-field="description"]')?.value || "";
      if (!firstStatusSelect) throw new Error("No status select available for filtered-row regression check.");
      firstStatusSelect.value = "Supported";
      firstStatusSelect.dispatchEvent(new Event("change", { bubbles: true }));
      const staleFilterAfter = visibleCount();
      const editedRowStillVisible = Array.from(document.querySelectorAll('#ledgerBody input[data-field="description"]'))
        .some((input) => input.value === editedRowDescription);

      filters.search = "";
      filters.type = "";
      filters.status = "";
      filters.includedOnly = false;
      search.value = "";
      type.value = "";
      status.value = "";
      includedOnly.checked = false;
      renderFilterOptions();
      renderLedger();

      return {
        searchRows,
        searchMatches,
        expenseCount,
        expectedExpenseCount,
        needsSupportCount,
        expectedNeedsSupportCount,
        includedOnlyCount,
        expectedIncludedOnlyCount,
        staleFilterBefore,
        staleFilterAfter,
        editedRowStillVisible,
        restoredRows: visibleCount()
      };
    })()
  `);
  assert(filterResult.searchRows > 0, "Search filter did not show matching rows.");
  assert(filterResult.searchMatches === true, "Search filter showed a non-matching row.");
  assert(filterResult.expenseCount === filterResult.expectedExpenseCount, "Type filter did not match expected visible rows.");
  assert(filterResult.needsSupportCount === filterResult.expectedNeedsSupportCount, "Status filter did not match expected visible rows.");
  assert(filterResult.includedOnlyCount === filterResult.expectedIncludedOnlyCount, "Included-only filter did not match expected visible rows.");
  assert(filterResult.staleFilterAfter === filterResult.staleFilterBefore - 1, "Filtered ledger did not rerender after an edited row stopped matching.");
  assert(filterResult.editedRowStillVisible === false, "Edited row remained visible after it stopped matching the active filter.");
  assert(filterResult.restoredRows > filterResult.includedOnlyCount, "Filters did not restore the full ledger.");

  const settingsResult = await evaluate(client, `
    (() => {
      const threshold = document.getElementById("threshold");
      threshold.value = "12000";
      threshold.dispatchEvent(new Event("input", { bubbles: true }));
      const projected = document.getElementById("coveredCaProjected");
      projected.value = "15000";
      projected.dispatchEvent(new Event("input", { bubbles: true }));
      const next12 = document.getElementById("coveredCaNext12");
      next12.value = "16000";
      next12.dispatchEvent(new Event("input", { bubbles: true }));
      const reviewDate = document.getElementById("reviewDate");
      reviewDate.value = "2026-07-15";
      reviewDate.dispatchEvent(new Event("input", { bubbles: true }));
      const saved = JSON.parse(localStorage.getItem(storageKey));
      return {
        threshold: state.settings.threshold,
        projected: state.settings.coveredCaProjected,
        next12: state.settings.coveredCaNext12,
        reviewDate: state.settings.reviewDate,
        savedThreshold: saved.settings.threshold,
        kpiThreshold: document.getElementById("kpiThreshold").textContent,
        summary: document.getElementById("summaryText").value
      };
    })()
  `);
  assert(settingsResult.threshold === 12000, "Threshold input did not update state.");
  assert(settingsResult.projected === 15000, "CoveredCA projected income input did not update state.");
  assert(settingsResult.next12 === 16000, "CoveredCA next 12-month input did not update state.");
  assert(settingsResult.reviewDate === "2026-07-15", "Review date input did not update state.");
  assert(settingsResult.savedThreshold === 12000, "Settings input did not persist to localStorage.");
  assert(settingsResult.kpiThreshold === "$12,000.00", "Threshold KPI did not rerender after settings change.");
  assert(settingsResult.summary.includes("Review date: 2026-07-15"), "Summary text did not include updated review date.");
  assert(settingsResult.summary.includes("$15,000.00"), "Summary text did not include updated CoveredCA projected income.");
}

async function verifyEditableControls(client) {
  const result = await evaluate(client, `
    (() => {
      const amountInput = document.querySelector('#ledgerBody input[data-field="amount"]');
      if (!amountInput) throw new Error("No amount input found.");
      amountInput.value = "18111";
      amountInput.dispatchEvent(new Event("input", { bubbles: true }));
      const descriptionInput = document.querySelector('#ledgerBody input[data-field="description"]');
      descriptionInput.value = "Smoke edited receipt";
      descriptionInput.dispatchEvent(new Event("input", { bubbles: true }));
      const businessPctInput = document.querySelector('#ledgerBody input[data-field="businessPct"]');
      businessPctInput.value = "50";
      businessPctInput.dispatchEvent(new Event("input", { bubbles: true }));
      const statusSelect = document.querySelector('#ledgerBody select[data-field="status"]');
      statusSelect.value = "CPA review";
      statusSelect.dispatchEvent(new Event("change", { bubbles: true }));
      const notesInput = document.querySelector('#ledgerBody textarea[data-field="notes"]');
      notesInput.value = "Smoke edited support note";
      notesInput.dispatchEvent(new Event("input", { bubbles: true }));
      return {
        amount: state.rows[0].amount,
        description: state.rows[0].description,
        businessPct: state.rows[0].businessPct,
        status: state.rows[0].status,
        notes: state.rows[0].notes,
        gross: document.getElementById("kpiGross").textContent,
        summaryHasUpdatedGross: document.getElementById("summaryText").value.includes("$25,111.00"),
        actionListUpdated: document.getElementById("actionReviewList").textContent.includes("Smoke edited receipt")
      };
    })()
  `);
  assert(result.amount === 18111, "Editable amount input did not update state.");
  assert(result.description === "Smoke edited receipt", "Editable description input did not update state.");
  assert(result.businessPct === 50, "Editable business percentage input did not update state.");
  assert(result.status === "CPA review", "Editable status select did not update state.");
  assert(result.notes === "Smoke edited support note", "Editable notes textarea did not update state.");
  assert(result.gross.includes("25,111"), "KPI gross did not update after amount edit.");
  assert(result.summaryHasUpdatedGross === true, "Summary text did not update after amount edit.");
  assert(result.actionListUpdated === true, "Action Center did not update after editable row changes.");
}

async function verifyMobileLayout(client) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 900,
    deviceScaleFactor: 1,
    mobile: true,
  });
  const loaded = client.once("Page.loadEventFired");
  await client.send("Page.navigate", { url: `http://127.0.0.1:${port}/index.html` });
  await loaded;
  await wait(750);
  const result = await evaluate(client, `
    (() => ({
      viewportWidth: window.innerWidth,
      bodyWidth: document.body.scrollWidth,
      overflow: document.body.scrollWidth > window.innerWidth,
      sidebarHeight: document.querySelector(".sidebar").getBoundingClientRect().height,
      topbarHeight: document.querySelector(".topbar").getBoundingClientRect().height,
      visibleCoreButtons: [
        "copyAgentBrief",
        "copyManifestStarter",
        "addRow",
        "exportCsv",
        "copySummary"
      ].every((id) => {
        const element = document.getElementById(id);
        return element && element.getBoundingClientRect().width > 0;
      }),
      kpiColumns: getComputedStyle(document.querySelector(".kpis")).gridTemplateColumns,
      actionColumns: getComputedStyle(document.querySelector(".action-grid")).gridTemplateColumns
    }))()
  `);
  assert(result.overflow === false, `Mobile layout overflowed: ${result.bodyWidth} > ${result.viewportWidth}`);
  assert(result.visibleCoreButtons === true, "One or more core buttons is not measurable on mobile.");
  assert(result.kpiColumns.split(" ").length === 1, "Mobile KPI grid did not collapse to one column.");
  assert(result.actionColumns.split(" ").length === 1, "Mobile action grid did not collapse to one column.");
  return result;
}

async function assertNoConsoleErrors(client, browserErrors) {
  const logs = await client.send("Runtime.evaluate", {
    expression: "window.__smoke?.alerts || []",
    returnByValue: true,
  });
  const alerts = logs.result?.value || [];
  assert(alerts.length === 0, `Unexpected alerts: ${alerts.join("; ")}`);
  assert(browserErrors.length === 0, `Unexpected browser errors: ${browserErrors.join("; ")}`);
}

async function main() {
  const server = await startServer();
  const profileDir = join(tmpdir(), `smb-financial-tracker-smoke-${Date.now()}`);
  await mkdir(profileDir, { recursive: true });
  const chrome = spawn(chromePath(), [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${chromeDebugPort}`,
    `--user-data-dir=${profileDir}`,
    "--window-size=1440,1100",
    `http://127.0.0.1:${port}/index.html`,
  ], { stdio: "ignore" });

  const report = {};
  try {
    const wsUrl = await getWebSocketUrl();
    const client = createCdpClient(wsUrl);
    await client.ready;
    const browserErrors = [];
    client.on("Runtime.exceptionThrown", (params) => {
      browserErrors.push(params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || "Runtime exception");
    });
    client.on("Runtime.consoleAPICalled", (params) => {
      if (params.type !== "error") return;
      browserErrors.push(params.args?.map((arg) => arg.value || arg.description || "").join(" ") || "console.error");
    });
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

    const ready = await assertPageReady(client);
    report.initialRows = ready.rowCount;
    report.initialButtons = ready.buttonCount;
    await verifyNavigation(client);
    await installSpies(client);
    await verifyActionButtons(client);
    await verifyFiltersAndSettings(client);
    await verifyLedgerButtons(client, ready.rowCount);
    await verifyImportsAndReset(client, ready.rowCount);
    await verifyEditableControls(client);
    await assertNoConsoleErrors(client, browserErrors);
    report.mobile = await verifyMobileLayout(client);
    client.close();
  } finally {
    chrome.kill("SIGTERM");
    await wait(750);
    server.close();
    await removeWithRetry(profileDir);
  }

  console.log(`Dashboard button smoke passed: ${JSON.stringify(report)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
