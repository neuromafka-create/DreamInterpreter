import { readFileSync } from "node:fs";

const SAMPLE_FRAME = [
  "Образец ниже относится только к случаю, когда человек сам предлагает правдоподобное телесное объяснение.",
  "Не переноси этот сюжет на другие сны.",
  "Из образца бери манеру: принять простое объяснение, не настаивать на символе, вопрос для самонаблюдения оставить необязательным и упоминать врача только если для этого есть повод в границах выше.",
].join(" ");

export function fencedText(markdown) {
  const match = markdown.match(/```text\r?\n([\s\S]*?)\r?\n```/);
  if (!match) {
    throw new Error("В документе нет блока ```text с системным промптом");
  }
  return match[1].trim();
}

export function sectionBlockquote(markdown, heading) {
  const start = markdown.indexOf(heading);
  if (start < 0) {
    throw new Error(`В документе нет раздела «${heading}»`);
  }
  const rest = markdown.slice(start + heading.length);
  const next = rest.search(/\n## /);
  const section = next === -1 ? rest : rest.slice(0, next);
  const quoted = [];
  let started = false;
  for (const line of section.split(/\r?\n/)) {
    if (line.startsWith(">")) {
      started = true;
      quoted.push(line.replace(/^>\s?/, ""));
    } else if (started && line.trim() === "") {
      quoted.push("");
    } else if (started) {
      break;
    }
  }
  const text = quoted.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!text) {
    throw new Error(`В разделе «${heading}» нет цитаты`);
  }
  return text;
}

export function loadAgent(markdown) {
  const instructions = fencedText(markdown);
  const greeting = sectionBlockquote(markdown, "## Шаблон первого сообщения агента");
  const sample = sectionBlockquote(markdown, "## Короткий пример ответа агента");
  const system = `${instructions}\n\n${SAMPLE_FRAME}\n\n${sample}`;
  return { instructions, greeting, sample, system };
}

export function loadAgentFile(file) {
  return loadAgent(readFileSync(file, "utf8"));
}
