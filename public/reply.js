function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderBlocks(text) {
  const blocks = escapeHtml(text).trim().split(/\n{2,}/);
  return blocks
    .filter(Boolean)
    .map((block) => {
      const withMarks = block.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      const lines = withMarks.split("\n");
      const items = lines.map((line) => line.trim()).filter(Boolean);
      const isList = items.length > 0 && items.every((line) => /^[-•]\s+/.test(line));
      if (isList) {
        const lis = items.map((line) => `<li>${line.replace(/^[-•]\s+/, "")}</li>`).join("");
        return `<ul>${lis}</ul>`;
      }
      return `<p>${lines.join("<br>")}</p>`;
    })
    .join("");
}

function withoutPartialThinkTag(text) {
  const match = text.match(/<\/?[a-z]*$/i);
  if (!match) return text;
  const fragment = match[0].toLowerCase();
  if ("<think".startsWith(fragment) || "</think".startsWith(fragment)) {
    return text.slice(0, match.index);
  }
  return text;
}

export function renderReply(text) {
  const source = withoutPartialThinkTag(text);
  const pattern = /<think>([\s\S]*?)(?:<\/think>|$)/gi;
  const pieces = [];
  let cursor = 0;
  for (const match of source.matchAll(pattern)) {
    const before = source.slice(cursor, match.index).trim();
    if (before) pieces.push(renderBlocks(before));
    const inner = match[1].trim();
    const closed = match[0].toLowerCase().endsWith("</think>");
    if (inner || !closed) {
      pieces.push(`<aside class="thought"><p class="thought-label">Размышление</p>${inner ? renderBlocks(inner) : ""}</aside>`);
    }
    cursor = match.index + match[0].length;
  }
  const after = source.slice(cursor).trim();
  if (after) pieces.push(renderBlocks(after));
  return pieces.join("");
}
