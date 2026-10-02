import { renderReply } from "./reply.js";

const thread = document.querySelector("#thread");
const connection = document.querySelector("#connection");
const status = document.querySelector("#status");
const form = document.querySelector("#composer");
const dream = document.querySelector("#dream");
const send = document.querySelector("#send");
const reset = document.querySelector("#reset");
const error = document.querySelector("#error");

let history = [];
let busy = false;
let controller = null;

try {
  localStorage.removeItem("dream-interpreter.model");
} catch {
  // The old model choice lived in the browser. The settings page owns it now.
}

function showError(message) {
  error.hidden = !message;
  error.textContent = message || "";
  status.textContent = message || "";
  if (message) error.scrollIntoView({ block: "nearest" });
}

function setBusy(next) {
  busy = next;
  dream.disabled = next;
  reset.disabled = next;
  syncSend();
}

function syncSend() {
  send.disabled = busy || dream.value.trim().length === 0;
}

function addTurn(role, text) {
  const article = document.createElement("article");
  article.className = `turn turn-${role}`;
  const who = document.createElement("p");
  who.className = "who";
  who.textContent = role === "user" ? "Вы" : "Толкователь";
  const body = document.createElement("div");
  body.className = "body";
  if (role === "user") body.textContent = text;
  else body.innerHTML = renderReply(text);
  article.append(who, body);
  thread.append(article);
  return article;
}

function showGreeting(greeting) {
  thread.replaceChildren();
  addTurn("agent", greeting);
}

function showConnection(intro) {
  let host = "";
  try {
    host = new URL(intro.baseUrl).host;
  } catch {
    host = "";
  }
  if (intro.needsKey && !intro.hasKey) {
    connection.textContent = host
      ? `Ключ для ${host} ещё не указан. Без него разбор не начнётся.`
      : "Ключ ещё не указан. Без него разбор не начнётся.";
    return;
  }
  connection.textContent = host
    ? `Отвечает ${intro.model}. Адрес: ${host}.`
    : `Отвечает ${intro.model}.`;
}

async function refreshConnection() {
  const introResponse = await fetch("/api/intro");
  const intro = await introResponse.json();
  if (!introResponse.ok) throw new Error(intro.error || "Не удалось открыть разговор.");
  showConnection(intro);
  if (history.length === 0) showGreeting(intro.greeting);
}

async function readStream(response, onDelta) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = JSON.parse(trimmed.slice(5).trim());
      if (payload.error) throw new Error(payload.error);
      if (payload.delta) {
        full += payload.delta;
        onDelta(full);
      }
    }
  }
  return full;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = dream.value.trim();
  if (!text || busy) return;

  showError("");
  const prior = history.slice();
  const outgoing = [...prior, { role: "user", content: text }];
  const userTurn = addTurn("user", text);
  const pending = addTurn("agent", "Смотрю на сюжет и на то, что вы чувствовали.");
  pending.classList.add("pending");
  dream.value = "";
  setBusy(true);
  status.textContent = "Читаю сон.";
  pending.scrollIntoView({ block: "nearest" });

  controller = new AbortController();
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({ messages: outgoing }),
      signal: controller.signal,
    });
    const type = response.headers.get("content-type") || "";
    if (!response.ok || type.includes("application/json")) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || "Не получилось получить ответ.");
    }
    const replyBody = pending.querySelector(".body");
    const full = await readStream(response, (textSoFar) => {
      pending.classList.remove("pending");
      replyBody.innerHTML = renderReply(textSoFar);
    });
    if (!full.trim()) throw new Error("Ответ получился пустым. Попробуйте ещё раз.");
    pending.classList.remove("pending");
    history = [...outgoing, { role: "assistant", content: full }];
    status.textContent = "Ответ готов.";
  } catch (err) {
    if (err.name === "AbortError") return;
    userTurn.remove();
    pending.remove();
    dream.value = text;
    showError(err.message || "Не получилось получить ответ.");
    history = prior;
  } finally {
    controller = null;
    setBusy(false);
    if (!error.hidden) dream.focus();
  }
});

reset.addEventListener("click", async () => {
  if (busy) return;
  if (history.length > 0 && !window.confirm("Начать новый разговор? Этот текст нигде не сохранён.")) return;
  controller?.abort();
  history = [];
  dream.value = "";
  showError("");
  status.textContent = "";
  try {
    await refreshConnection();
  } catch (err) {
    showError(err.message);
  }
  dream.focus();
});

dream.addEventListener("input", syncSend);
dream.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && !event.isComposing) {
    event.preventDefault();
    form.requestSubmit();
  }
});

syncSend();
window.addEventListener("pageshow", () => {
  refreshConnection().catch((err) => showError(err.message));
});
