import { execFile, spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHandler, loadEnvFile } from "./server.mjs";
import { fileStore } from "./src/store.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

export function browserCandidates(env = process.env) {
  const roots = [env["ProgramFiles(x86)"], env.ProgramFiles, env.LOCALAPPDATA];
  const names = [
    ["Microsoft", "Edge", "Application", "msedge.exe"],
    ["Google", "Chrome", "Application", "chrome.exe"],
  ];
  const files = [];
  for (const base of roots) {
    if (!base) continue;
    for (const parts of names) files.push(path.join(base, ...parts));
  }
  return files;
}

export function findBrowser(candidates) {
  return candidates.find((file) => file && existsSync(file)) || "";
}

export function runningOwner(lock, isAlive) {
  const port = Number(lock?.port);
  const pid = Number(lock?.pid);
  if (!Number.isInteger(port) || port <= 0 || !Number.isInteger(pid) || pid <= 0) return null;
  if (!isAlive(pid)) return null;
  return { port, pid };
}

export function windowArgs(url, profileDir, extra = []) {
  return [
    `--app=${url}`,
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-sync",
    "--disable-extensions",
    "--disable-features=msEdgeFirstRunExperience",
    "--lang=ru",
    "--window-size=1040,900",
    ...extra,
  ];
}

function appPaths(env = process.env) {
  const base = env.LOCALAPPDATA || path.join(homedir(), "AppData", "Local");
  const dir = path.join(base, "DreamInterpreter");
  return {
    dir,
    profile: path.join(dir, "window"),
    lock: path.join(dir, "desktop.json"),
  };
}

function readLock(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function pidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function pageUrl(port) {
  return `http://127.0.0.1:${port}/`;
}

async function portOpen(port) {
  try {
    const response = await fetch(pageUrl(port), { signal: AbortSignal.timeout(800) });
    return response.ok;
  } catch {
    return false;
  }
}

function tell(message) {
  console.error(message);
  if (process.platform !== "win32" || process.env.DREAM_DESKTOP_SILENT === "1") return Promise.resolve();
  const safe = String(message).replaceAll("'", "''");
  const script = `Add-Type -AssemblyName PresentationFramework\n[System.Windows.MessageBox]::Show('${safe}', 'Толкователь снов')\n`;
  const encoded = Buffer.from(script, "utf16le").toString("base64");
  return new Promise((resolve) => {
    const popup = spawn("powershell.exe", ["-NoProfile", "-STA", "-EncodedCommand", encoded], {
      stdio: "ignore",
      windowsHide: true,
    });
    popup.on("exit", () => resolve());
    popup.on("error", () => resolve());
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function windowPids(profile) {
  const marker = profile.toLowerCase().replaceAll("'", "''");
  const script = `$m='${marker}'; @(Get-CimInstance Win32_Process -Filter "Name = 'msedge.exe' OR Name = 'chrome.exe'" | Where-Object { $_.CommandLine -and $_.CommandLine.ToLower().Contains($m) }).ProcessId`;
  return new Promise((resolve) => {
    execFile("powershell.exe", ["-NoProfile", "-Command", script], { windowsHide: true, timeout: 15000 }, (error, stdout) => {
      if (error) {
        resolve(null);
        return;
      }
      const pids = String(stdout).split(/\s+/).map(Number).filter((pid) => Number.isInteger(pid) && pid > 0);
      resolve(pids);
    });
  });
}

function stopWindows(pids) {
  for (const pid of pids) {
    spawn("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
  }
}

async function waitForWindow(profile) {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const pids = await windowPids(profile);
    if (pids?.length) return true;
    await sleep(400);
  }
  return false;
}

async function waitUntilClosed(profile, isClosing) {
  let emptyPolls = 0;
  while (!isClosing()) {
    const pids = await windowPids(profile);
    if (pids && pids.length === 0) {
      emptyPolls += 1;
      if (emptyPolls >= 2) return;
    } else {
      emptyPolls = 0;
    }
    await sleep(1000);
  }
}

function openWindow(browser, port, profile, { detached }) {
  const extra = [];
  if (process.env.DREAM_DESKTOP_DEBUG_PORT) {
    extra.push(`--remote-debugging-port=${process.env.DREAM_DESKTOP_DEBUG_PORT}`);
  }
  return spawn(browser, windowArgs(pageUrl(port), profile, extra), {
    detached,
    stdio: "ignore",
    windowsHide: false,
  });
}

function listen(port) {
  loadEnvFile(path.join(root, ".env"));
  const server = createServer(createHandler({
    store: fileStore(path.join(root, "data", "connection.json")),
  }));
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

async function main() {
  const browser = findBrowser(browserCandidates());
  if (!browser) {
    await tell("Не найдены Microsoft Edge и Google Chrome. Окно толкователя открывается через один из них.");
    process.exit(1);
  }

  const paths = appPaths();
  mkdirSync(paths.dir, { recursive: true });
  const existing = runningOwner(readLock(paths.lock), pidAlive);
  if (existing && await portOpen(existing.port)) {
    const extra = openWindow(browser, existing.port, paths.profile, { detached: true });
    extra.unref();
    return;
  }
  rmSync(paths.lock, { force: true });

  const server = await listen(0);
  const { port } = server.address();
  try {
    writeFileSync(paths.lock, JSON.stringify({ pid: process.pid, port }), { flag: "wx" });
  } catch (error) {
    server.close();
    if (error?.code !== "EEXIST") throw error;
    const winner = runningOwner(readLock(paths.lock), pidAlive);
    if (winner) {
      const extra = openWindow(browser, winner.port, paths.profile, { detached: true });
      extra.unref();
    }
    return;
  }

  let closing = false;
  const shutdown = (code) => {
    if (closing) return;
    closing = true;
    rmSync(paths.lock, { force: true });
    server.close(() => process.exit(code));
    setTimeout(() => process.exit(code), 800).unref();
  };
  const closeWindow = () => {
    windowPids(paths.profile).then((pids) => {
      if (pids?.length) stopWindows(pids);
      shutdown(0);
    });
  };

  const windowProcess = openWindow(browser, port, paths.profile, { detached: false });
  windowProcess.unref();
  windowProcess.once("error", (error) => {
    tell(`Не удалось открыть окно: ${error.message}`).finally(() => shutdown(1));
  });
  process.once("SIGINT", closeWindow);
  process.once("SIGBREAK", closeWindow);

  const opened = await waitForWindow(paths.profile);
  if (!opened) {
    await tell("Окно толкователя не открылось.");
    shutdown(1);
    return;
  }
  console.log(`Толкователь снов открыт: ${pageUrl(port)}`);
  await waitUntilClosed(paths.profile, () => closing);
  shutdown(0);
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  main().catch(async (error) => {
    await tell(error?.message || "Не удалось открыть толкователь.");
    process.exit(1);
  });
}
