const form = document.querySelector("#settings");
const presetList = document.querySelector("#preset-list");
const baseUrl = document.querySelector("#base-url");
const apiKey = document.querySelector("#api-key");
const keyNote = document.querySelector("#key-note");
const model = document.querySelector("#model");
const modelList = document.querySelector("#model-list");
const modelNote = document.querySelector("#model-note");
const error = document.querySelector("#error");
const saved = document.querySelector("#saved");
const forget = document.querySelector("#forget");

const THEME_KEY = "dream-interpreter.theme";
const THEMES = ["intel", "amd", "adobe"];
let presets = [];
let clearKey = false;

function applyTheme(theme) {
  const next = THEMES.includes(theme) ? theme : "intel";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // The choice still applies to this page when storage is blocked.
  }
  const radio = form.querySelector(`input[name="theme"][value="${next}"]`);
  if (radio) radio.checked = true;
}

form.querySelector("#theme-list").addEventListener("change", (event) => {
  if (event.target.name === "theme") applyTheme(event.target.value);
});

applyTheme(document.documentElement.dataset.theme || "intel");

function unlockKey() {
  apiKey.readOnly = false;
}

apiKey.addEventListener("pointerdown", unlockKey);
apiKey.addEventListener("focus", unlockKey);

function showError(message) {
  error.hidden = !message;
  error.textContent = message || "";
  if (message) saved.textContent = "";
}

function showSaved(message) {
  saved.textContent = message || "";
  if (message) showError("");
}

function setBusy(next) {
  for (const element of form.elements) element.disabled = next;
}

function knownModels() {
  return new Set(presets.map((preset) => preset.model).filter(Boolean));
}

function renderPresets(selectedId) {
  presetList.replaceChildren();
  const items = [...presets, { id: "custom", name: "Свой адрес", baseUrl: "", model: "" }];
  for (const preset of items) {
    const label = document.createElement("label");
    label.className = "choice";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "preset";
    input.value = preset.id;
    input.checked = preset.id === selectedId;
    input.addEventListener("change", () => {
      if (!input.checked || preset.id === "custom") return;
      baseUrl.value = preset.baseUrl;
      if (preset.model) model.value = preset.model;
      else if (knownModels().has(model.value.trim())) model.value = "";
      showSaved("");
    });
    label.append(input, document.createTextNode(preset.name));
    presetList.append(label);
  }
}

function selectMatchingPreset() {
  const selected = presets.find((preset) => preset.baseUrl === baseUrl.value.trim());
  const id = selected ? selected.id : "custom";
  const radio = presetList.querySelector(`input[value="${CSS.escape(id)}"]`);
  if (radio) radio.checked = true;
}

function showKeyState(data) {
  forget.hidden = !data.hasKey;
  if (!data.hasKey && !data.needsKey) {
    keyNote.textContent = "Для сервера на этом компьютере ключ необязателен.";
    return;
  }
  if (!data.hasKey) {
    keyNote.textContent = "Ключ ещё не указан.";
    return;
  }
  const hint = data.keyHint ? ` (${data.keyHint})` : "";
  keyNote.textContent = data.source === "env"
    ? `Ключ уже задан в окружении сервера${hint} и в поле не подставляется. Пустое поле сохранит его для этого же адреса.`
    : `Ключ сохранён${hint} и в поле не подставляется. Пустое поле оставляет его.`;
}

function fillModels(models) {
  modelList.replaceChildren();
  for (const item of models) {
    const option = document.createElement("option");
    option.value = item.id;
    if (item.name && item.name !== item.id) option.label = item.name;
    modelList.append(option);
  }
}

function payload() {
  return {
    baseUrl: baseUrl.value.trim(),
    apiKey: apiKey.value,
    model: model.value.trim(),
    clearKey,
  };
}

async function readPayload(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Не получилось выполнить запрос.");
  return data;
}

baseUrl.addEventListener("input", () => {
  selectMatchingPreset();
  showSaved("");
});

apiKey.addEventListener("input", () => {
  if (apiKey.value.trim()) clearKey = false;
  showSaved("");
});

model.addEventListener("input", () => showSaved(""));

forget.addEventListener("click", () => {
  clearKey = true;
  apiKey.value = "";
  forget.hidden = true;
  keyNote.textContent = "Ключ будет удалён, когда сохраните.";
  showSaved("");
});

document.querySelector("#check").addEventListener("click", async () => {
  if (!form.reportValidity()) return;
  showError("");
  showSaved("");
  setBusy(true);
  modelNote.textContent = "Проверяю каталог…";
  try {
    const response = await fetch("/api/settings/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload()),
    });
    const data = await readPayload(response);
    fillModels(Array.isArray(data.models) ? data.models : []);
    modelNote.textContent = data.ok
      ? `Связь есть. В каталоге моделей: ${data.models.length}.`
      : (data.error || "Каталог не открылся.");
  } catch (err) {
    modelNote.textContent = "";
    showError(err.message || "Не получилось проверить подключение.");
  } finally {
    setBusy(false);
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  showError("");
  setBusy(true);
  try {
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload()),
    });
    const data = await readPayload(response);
    clearKey = false;
    apiKey.value = "";
    showKeyState(data);
    showSaved("Сохранено. Можно вернуться к разговору.");
  } catch (err) {
    showError(err.message || "Не получилось сохранить подключение.");
  } finally {
    setBusy(false);
  }
});

async function load() {
  const response = await fetch("/api/settings");
  const data = await readPayload(response);
  presets = Array.isArray(data.presets) ? data.presets : [];
  baseUrl.value = data.baseUrl || "";
  model.value = data.model || "";
  const selected = presets.find((preset) => preset.baseUrl === data.baseUrl);
  renderPresets(selected ? selected.id : "custom");
  showKeyState(data);
}

load().catch((err) => showError(err.message));
