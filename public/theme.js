const THEME_KEY = "dream-interpreter.theme";
const SCHEME_KEY = "dream-interpreter.scheme";
const THEMES = ["intel", "amd", "adobe"];
const SCHEMES = ["dark", "light"];

function readStored(key, allowed, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return allowed.includes(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}

function paintTheme(theme) {
  document.documentElement.dataset.theme = THEMES.includes(theme) ? theme : "intel";
}

function paintScheme(scheme) {
  document.documentElement.dataset.scheme = scheme === "light" ? "light" : "dark";
}

function remember(key, value, paint) {
  paint(value);
  try {
    localStorage.setItem(key, document.documentElement.dataset[key === THEME_KEY ? "theme" : "scheme"]);
  } catch {
    // The choice still applies to this page when storage is blocked.
  }
}

paintTheme(readStored(THEME_KEY, THEMES, "intel"));
paintScheme(readStored(SCHEME_KEY, SCHEMES, "dark"));

document.addEventListener("change", (event) => {
  const input = event.target;
  if (!input) return;
  if (input.name === "theme") remember(THEME_KEY, input.value, paintTheme);
  if (input.name === "scheme") remember(SCHEME_KEY, input.value, paintScheme);
});

document.addEventListener("DOMContentLoaded", () => {
  const theme = document.documentElement.dataset.theme;
  const scheme = document.documentElement.dataset.scheme;
  const themeRadio = document.querySelector(`input[name="theme"][value="${theme}"]`);
  const schemeRadio = document.querySelector(`input[name="scheme"][value="${scheme}"]`);
  if (themeRadio) themeRadio.checked = true;
  if (schemeRadio) schemeRadio.checked = true;
});

window.addEventListener("storage", (event) => {
  if (event.key === THEME_KEY) paintTheme(event.newValue);
  if (event.key === SCHEME_KEY) paintScheme(event.newValue);
});
