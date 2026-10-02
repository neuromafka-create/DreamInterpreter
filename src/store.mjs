import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

export function memoryStore(initial = null) {
  let current = initial;
  return {
    read() {
      return current;
    },
    write(next) {
      current = next;
    },
  };
}

export function fileStore(file) {
  return {
    read() {
      if (!existsSync(file)) return null;
      try {
        const parsed = JSON.parse(readFileSync(file, "utf8"));
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
        return parsed;
      } catch {
        console.error("Файл подключения не прочитался. Используются значения окружения.");
        return null;
      }
    },
    write(next) {
      const data = `${JSON.stringify({
        baseUrl: next.baseUrl,
        apiKey: next.apiKey,
        model: next.model,
      })}\n`;
      mkdirSync(path.dirname(file), { recursive: true });
      const tmp = `${file}.${process.pid}.tmp`;
      writeFileSync(tmp, data, { mode: 0o600 });
      try {
        renameSync(tmp, file);
      } catch {
        writeFileSync(file, data, { mode: 0o600 });
        rmSync(tmp, { force: true });
      }
    },
  };
}
