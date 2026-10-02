import { HttpError } from "./chat.mjs";

export const DEFAULT_BASE_URL = "https://api.hubris.pw/v1";
export const DEFAULT_MODEL = "anthropic/claude-haiku-4.5";

export const PRESETS = [
  {
    id: "hubris",
    name: "Hubris",
    baseUrl: "https://api.hubris.pw/v1",
    model: "anthropic/claude-haiku-4.5",
  },
  {
    id: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openai/gpt-4o-mini",
  },
  {
    id: "groq",
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
  },
  {
    id: "ollama",
    name: "Ollama",
    baseUrl: "http://127.0.0.1:11434/v1",
    model: "",
  },
  {
    id: "lmstudio",
    name: "LM Studio",
    baseUrl: "http://127.0.0.1:1234/v1",
    model: "",
  },
];

const MODEL_ID = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,127}$/;
const MAX_KEY = 512;

export function connectionConfig(env) {
  const baseUrl = normalizeBaseUrl(env.AI_BASE_URL || env.HUBRIS_BASE_URL || DEFAULT_BASE_URL);
  const apiKey = String(env.HUBRIS_API_KEY || env.AI_API_KEY || "").trim();
  const model = normalizeModel(
    env.HUBRIS_MODEL || env.AI_MODEL || DEFAULT_MODEL,
    "Модель по умолчанию записана неверно.",
  );
  return { baseUrl, apiKey, model };
}

export function activeConnection(env, saved) {
  if (saved == null) return { connection: connectionConfig(env), source: "env" };
  try {
    return { connection: parseSaved(saved), source: "saved" };
  } catch (error) {
    const message = error instanceof HttpError ? error.message : "не разобрать";
    console.error(`Сохранённое подключение пропущено: ${message}`);
    return { connection: connectionConfig(env), source: "env" };
  }
}

export function parseSaved(saved) {
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
    throw new HttpError(500, "Сохранённое подключение записано неверно.");
  }
  return {
    baseUrl: normalizeBaseUrl(saved.baseUrl),
    apiKey: typeof saved.apiKey === "string" ? saved.apiKey.trim() : "",
    model: normalizeModel(saved.model, "Сохранённая модель записана неверно."),
  };
}

export function applySettings(previous, input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new HttpError(400, "Не получилось прочитать настройки.");
  }
  const baseUrl = normalizeBaseUrl(input.baseUrl, 400);
  const model = normalizeModel(input.model);
  const typed = typeof input.apiKey === "string" ? input.apiKey.trim() : "";
  if (typed.length > MAX_KEY || /[\r\n\0]/.test(typed)) {
    throw new HttpError(400, "Ключ записан неверно.");
  }
  const samePlace = Boolean(previous && previous.baseUrl === baseUrl);
  let apiKey = "";
  if (typed) apiKey = typed;
  else if (input.clearKey === true) apiKey = "";
  else if (samePlace) apiKey = String(previous.apiKey || "");
  else if (!requiresKey(baseUrl)) apiKey = "";
  else throw new HttpError(400, "Для нового адреса нужен свой ключ. Впишите его в поле.");
  return { baseUrl, apiKey, model };
}

export function keyHint(apiKey) {
  if (!apiKey || apiKey.length < 12) return "";
  return `…${apiKey.slice(-4)}`;
}

export function publicConnection(connection, source) {
  return {
    baseUrl: connection.baseUrl,
    model: connection.model,
    hasKey: Boolean(connection.apiKey),
    keyHint: keyHint(connection.apiKey),
    needsKey: requiresKey(connection.baseUrl),
    source,
    presets: PRESETS,
  };
}

export function requiresKey(baseUrl) {
  let url;
  try {
    url = new URL(baseUrl);
  } catch {
    return true;
  }
  return !(url.protocol === "http:" && isLoopback(url.hostname));
}

function isLoopback(hostname) {
  const host = String(hostname).toLowerCase().replace(/^\[|\]$/g, "");
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

export function normalizeBaseUrl(value, status = 500) {
  let url;
  try {
    url = new URL(String(value ?? "").trim());
  } catch {
    throw new HttpError(status, "Адрес API записан неверно. Нужен полный адрес, например https://api.hubris.pw/v1.");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new HttpError(status, "В адресе API оставьте только хост и путь, без ключа и параметров.");
  }
  if (url.protocol === "http:") {
    if (!isLoopback(url.hostname)) {
      throw new HttpError(
        status,
        "По обычному http можно подключиться только к серверу на этом компьютере: 127.0.0.1 или localhost. Для остальных адресов нужен https.",
      );
    }
  } else if (url.protocol !== "https:") {
    throw new HttpError(status, "Адрес API должен начинаться с https://.");
  }
  return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
}

export function normalizeModel(value, message = "Имя модели записано неверно.") {
  const model = String(value ?? "").trim();
  if (!MODEL_ID.test(model)) throw new HttpError(400, message);
  return model;
}

function isChatModel(row) {
  const output = row.architecture?.output_modalities;
  if (Array.isArray(output)) return output.includes("text");
  return !/(embed|whisper|transcribe|\btts\b|image|moderation|rerank)/i.test(row.id);
}

export function catalogModels(payload) {
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  const models = [];
  const seen = new Set();
  for (const row of rows) {
    if (!row || typeof row.id !== "string" || !MODEL_ID.test(row.id) || !isChatModel(row)) continue;
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    const name = typeof row.name === "string" && row.name.trim() ? row.name.trim() : row.id;
    models.push({ id: row.id, name });
  }
  models.sort((a, b) => a.id.localeCompare(b.id));
  return models;
}
