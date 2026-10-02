export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 8000;
const MAX_TOTAL_CHARS = 32000;

export function sanitizeMessages(input) {
  if (!Array.isArray(input)) {
    throw new HttpError(400, "Нужен список сообщений.");
  }
  if (input.length === 0) {
    throw new HttpError(400, "Напишите сон, прежде чем отправлять.");
  }
  if (input.length > MAX_MESSAGES) {
    throw new HttpError(400, "Разговор стал слишком длинным. Начните новый сон.");
  }

  let total = 0;
  const messages = input.map((message, index) => {
    if (!message || typeof message !== "object") {
      throw new HttpError(400, "Сообщение записано в непонятном виде.");
    }
    if (message.role !== "user" && message.role !== "assistant") {
      throw new HttpError(400, "В разговор можно добавлять только реплики вас и толкователя.");
    }
    if (typeof message.content !== "string") {
      throw new HttpError(400, "Текст сообщения должен быть строкой.");
    }
    const content = message.content.trim();
    if (!content) {
      throw new HttpError(400, "Пустое сообщение отправлять не нужно.");
    }
    if (content.length > MAX_MESSAGE_CHARS) {
      throw new HttpError(400, "Одно сообщение слишком длинное. Сократите его и отправьте снова.");
    }
    const expected = index % 2 === 0 ? "user" : "assistant";
    if (message.role !== expected) {
      throw new HttpError(400, "Реплики должны идти по очереди: сначала вы, потом толкователь.");
    }
    total += content.length;
    return { role: message.role, content };
  });

  if (messages.at(-1).role !== "user") {
    throw new HttpError(400, "Последней должна быть ваша реплика.");
  }
  if (total > MAX_TOTAL_CHARS) {
    throw new HttpError(400, "Разговор стал слишком длинным. Начните новый сон.");
  }
  return messages;
}

export function upstreamBody({ model, system, greeting, messages }) {
  return {
    model,
    stream: true,
    messages: [
      { role: "system", content: system },
      { role: "assistant", content: greeting },
      ...messages,
    ],
  };
}

export function deltaFromLine(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return "";
  const data = trimmed.slice(5).trim();
  if (!data || data === "[DONE]") return "";
  let json;
  try {
    json = JSON.parse(data);
  } catch {
    return "";
  }
  const content = json.choices?.[0]?.delta?.content;
  return typeof content === "string" ? content : "";
}

export async function* contentDeltas(byteStream) {
  const reader = byteStream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const delta = deltaFromLine(line);
        if (delta) yield delta;
      }
    }
    const tail = deltaFromLine(buffer);
    if (tail) yield tail;
  } finally {
    reader.releaseLock();
  }
}
