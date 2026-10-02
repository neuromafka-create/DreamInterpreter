import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { contentDeltas, HttpError, sanitizeMessages, upstreamBody } from "./src/chat.mjs";
import { loadAgentFile } from "./src/prompt.mjs";
import { activeConnection, applySettings, catalogModels, publicConnection, requiresKey } from "./src/provider.mjs";
import { fileStore, memoryStore } from "./src/store.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const publicDir = path.join(root, "public");
const promptFile = path.join(root, "docs", "02 Системный промпт для агента.md");
const MAX_BODY = 256 * 1024;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

export function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function publicFile(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split("?")[0]);
  } catch {
    return null;
  }
  if (decoded.includes("\\") || decoded.includes("\0")) return null;
  let relative;
  if (decoded === "/" || decoded === "") relative = "index.html";
  else if (decoded === "/settings") relative = "settings.html";
  else relative = decoded.replace(/^\/+/, "");
  const full = path.resolve(publicDir, relative);
  const fromRoot = path.relative(publicDir, full);
  if (fromRoot.startsWith("..") || path.isAbsolute(fromRoot)) return null;
  return full;
}

function withAssetVersions(html) {
  return html.replace(
    /(href|src)="(\/[^"]+?\.(?:css|js|svg))(?:\?[^"]*)?"/g,
    (full, attr, urlPath) => {
      const asset = publicFile(urlPath);
      if (!asset || !existsSync(asset)) return full;
      const version = Math.round(statSync(asset).mtimeMs).toString(36);
      return `${attr}="${urlPath}?v=${version}"`;
    },
  );
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let settled = false;
    const fail = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        fail(new HttpError(413, "Сообщение слишком большое."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (settled) return;
      settled = true;
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", fail);
  });
}

function parseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "Не получилось прочитать запрос.");
  }
}

function assertSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return;
  let url;
  try {
    url = new URL(origin);
  } catch {
    throw new HttpError(403, "Запрос отклонён.");
  }
  const host = req.headers.host;
  if (!host || url.host !== host) throw new HttpError(403, "Запрос отклонён.");
}

function authHeaders(apiKey) {
  const headers = {};
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  return headers;
}

function openCompletion(fetchImpl, { baseUrl, apiKey, body, signal }) {
  return fetchImpl(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      ...authHeaders(apiKey),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });
}

function failureMessage(status) {
  if (status === 401 || status === 403) return "Ключ не принят. Проверьте его в настройках.";
  if (status === 402) return "На балансе не хватает средств для этой модели. Пополните баланс или выберите другую.";
  if (status === 404) return "Такой модели нет у подключённого API. Проверьте имя в настройках.";
  return "Толкователь сейчас не может ответить. Попробуйте ещё раз через минуту.";
}

export function createHandler(options = {}) {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const agent = options.agent ?? loadAgentFile(options.promptFile ?? promptFile);
  const store = options.store ?? memoryStore(null);

  function current() {
    return activeConnection(env, store.read());
  }

  return async function handler(req, res) {
    try {
      const url = new URL(req.url ?? "/", "http://127.0.0.1");
      if (url.pathname === "/api/settings" && req.method === "GET") {
        const state = current();
        sendJson(res, 200, publicConnection(state.connection, state.source));
        return;
      }
      if (url.pathname === "/api/settings" && req.method === "PUT") {
        assertSameOrigin(req);
        const state = current();
        const next = applySettings(state.connection, parseJson(await readBody(req)));
        store.write(next);
        sendJson(res, 200, publicConnection(next, "saved"));
        return;
      }
      if (url.pathname === "/api/settings/check" && req.method === "POST") {
        assertSameOrigin(req);
        const state = current();
        const probe = applySettings(state.connection, parseJson(await readBody(req)));
        const catalog = await loadCatalog(fetchImpl, probe);
        sendJson(res, 200, catalog.error
          ? { ok: false, models: catalog.models, error: catalog.error }
          : { ok: true, models: catalog.models });
        return;
      }
      if (url.pathname === "/api/intro" && req.method === "GET") {
        const { connection } = current();
        sendJson(res, 200, {
          greeting: agent.greeting,
          model: connection.model,
          baseUrl: connection.baseUrl,
          hasKey: Boolean(connection.apiKey),
          needsKey: requiresKey(connection.baseUrl),
        });
        return;
      }
      if (url.pathname === "/api/models" && req.method === "GET") {
        const { connection } = current();
        const catalog = await loadCatalog(fetchImpl, connection);
        const body = {
          models: catalog.models,
          model: connection.model,
          configured: Boolean(connection.apiKey) || !requiresKey(connection.baseUrl),
        };
        if (catalog.error) body.error = catalog.error;
        sendJson(res, 200, body);
        return;
      }
      if (url.pathname === "/api/chat" && req.method === "POST") {
        await handleChat(req, res, { fetchImpl, agent, connection: current().connection });
        return;
      }
      if (url.pathname.startsWith("/api/")) {
        sendJson(res, 404, { error: "Такой страницы нет." });
        return;
      }
      if (req.method === "GET") {
        await serveStatic(res, url.pathname);
        return;
      }
      sendJson(res, 404, { error: "Такой страницы нет." });
    } catch (error) {
      if (res.headersSent) {
        res.end();
        return;
      }
      const status = error instanceof HttpError ? error.status : 500;
      const message = error instanceof HttpError ? error.message : "Внутренняя ошибка сервера.";
      if (status === 500) console.error(error);
      sendJson(res, status, { error: message });
    }
  };
}

async function loadCatalog(fetchImpl, connection) {
  if (!connection.apiKey && requiresKey(connection.baseUrl)) {
    return {
      models: [],
      error: "Каталог откроется после ключа. Имя модели можно вписать вручную.",
    };
  }
  const headers = authHeaders(connection.apiKey);
  let response;
  try {
    response = await fetchImpl(`${connection.baseUrl}/models`, {
      headers,
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    console.error("models request failed", error?.name || "Error");
    return {
      models: [],
      error: "Каталог моделей сейчас не открылся. Имя модели можно вписать вручную.",
    };
  }
  if (!response?.ok) {
    console.error(`models status ${response?.status ?? 0}`);
    return { models: [], error: failureMessage(response?.status ?? 502) };
  }
  try {
    return { models: catalogModels(await response.json()), error: "" };
  } catch {
    return {
      models: [],
      error: "Каталог моделей сейчас не открылся. Имя модели можно вписать вручную.",
    };
  }
}

async function handleChat(req, res, { fetchImpl, agent, connection }) {
  if (!connection.apiKey && requiresKey(connection.baseUrl)) {
    sendJson(res, 503, { error: "Нет ключа API. Откройте настройки и укажите ключ." });
    return;
  }

  let payload;
  try {
    payload = parseJson(await readBody(req));
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "Не получилось прочитать сообщение.");
  }

  const messages = sanitizeMessages(payload.messages);
  const body = upstreamBody({
    model: connection.model,
    system: agent.system,
    greeting: agent.greeting,
    messages,
  });

  const clientAbort = new AbortController();
  res.on("close", () => {
    if (!res.writableEnded) clientAbort.abort();
  });
  const signal = AbortSignal.any([clientAbort.signal, AbortSignal.timeout(120000)]);

  let upstream;
  try {
    upstream = await openCompletion(fetchImpl, {
      baseUrl: connection.baseUrl,
      apiKey: connection.apiKey,
      body,
      signal,
    });
  } catch (error) {
    if (clientAbort.signal.aborted) return;
    console.error("model request failed", error?.name || "Error");
    throw new HttpError(502, failureMessage(502));
  }

  if (!upstream || !upstream.ok) {
    const status = upstream?.status ?? 400;
    console.error(`model status ${status}`);
    throw new HttpError(status === 401 || status === 403 ? 401 : 502, failureMessage(status));
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Accel-Buffering": "no",
  });

  let wrote = false;
  try {
    for await (const delta of contentDeltas(upstream.body)) {
      wrote = true;
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    }
  } catch (error) {
    if (!clientAbort.signal.aborted) {
      console.error("model stream failed", error?.name || "Error");
      res.write(`data: ${JSON.stringify({ error: "Ответ оборвался. Можно отправить рассказ ещё раз." })}\n\n`);
    }
    res.end();
    return;
  }

  if (!wrote) {
    res.write(`data: ${JSON.stringify({ error: "Ответ получился пустым. Попробуйте ещё раз." })}\n\n`);
  } else {
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  }
  res.end();
}

async function serveStatic(res, urlPath) {
  const file = publicFile(urlPath);
  if (!file || !existsSync(file)) {
    sendJson(res, 404, { error: "Такой страницы нет." });
    return;
  }
  const ext = path.extname(file).toLowerCase();
  const type = TYPES[ext];
  if (!type) {
    sendJson(res, 404, { error: "Такой страницы нет." });
    return;
  }
  let body = readFileSync(file);
  if (ext === ".html") body = Buffer.from(withAssetVersions(body.toString("utf8")), "utf8");
  const revalidate = ext === ".html" || ext === ".css" || ext === ".js";
  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": body.length,
    "Cache-Control": revalidate ? "no-cache" : "public, max-age=86400",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy":
      "default-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'",
  });
  res.end(body);
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  loadEnvFile(path.join(root, ".env"));
  const port = Number(process.env.PORT || 4173);
  const server = createServer(createHandler({
    store: fileStore(path.join(root, "data", "connection.json")),
  }));
  server.listen(port, "127.0.0.1", () => {
    console.log(`Толкователь снов: http://127.0.0.1:${port}`);
  });
}
