import * as __SNOWPACK_ENV__ from '../_snowpack/env.js';

import * as monaco from "../_snowpack/pkg/monaco-editor.js";
import initMonaco from "./lib/monaco/init.js";
import initAltJSONOptions from "./lib/alt-json-options/init.js";
import altJSONs from "./lib/alt-json/index.js";
import {expose, exposeAllAltJSONs, greeting} from "./greeting.js";
import {isDarkTheme} from "./dark-theme/index.js";
import {lumaDarkThemeName} from "./lib/monaco/themes/dark.js";
import {lumaLightThemeName} from "./lib/monaco/themes/light.js";
const parserOwner = "alt-json";
const defaultJSON = {
  hello: [
    {
      world: {
        from: ["your", "hands"]
      }
    }
  ],
  in: [
    {
      seconds: {
        anywhere: "anytime."
      }
    }
  ]
};
const localStorageKeys = Object.freeze({
  theme: "theme",
  leftLang: "leftLang",
  rightLang: "rightLang",
  lastLang: "lastLang",
  lastCode: "lastCode",
  lastValid: "lastValid"
});
const convertFrom = (langFrom, str) => {
  const altFrom = altJSONs.find((a) => a.name === langFrom);
  if (!altFrom)
    throw new Error(`langFrom=${langFrom} not defined`);
  const from = altFrom.toJSON(str);
  return from;
};
const convertTo = (json, langTo) => {
  const altTo = altJSONs.find((a) => a.name === langTo);
  if (!altTo)
    throw new Error(`langTo=${langTo} not defined`);
  const to = altTo.fromJSON(json);
  return to;
};
let theme = localStorage.getItem(localStorageKeys.theme);
const getMonacoTheme = (isDark) => {
  return isDark ? lumaDarkThemeName : lumaLightThemeName;
};
const updateTheme = (isDark) => {
  if (isDark) {
    document.body.classList.add("is-dark");
    document.body.classList.remove("is-light");
  } else {
    document.body.classList.remove("is-dark");
    document.body.classList.add("is-light");
  }
  monaco.editor.setTheme(getMonacoTheme(isDark));
};
const getTheme = () => {
  if (theme === "light")
    return false;
  if (theme === "dark")
    return true;
  return isDarkTheme();
};
const initTheme = () => {
  const select = document.querySelector("#theme");
  if (!(select instanceof HTMLSelectElement)) {
    throw new Error("no #theme");
  }
  if (theme === "light" || theme === "dark") {
    select.value = theme;
  }
  updateTheme(getTheme());
  select.addEventListener("change", () => {
    theme = select.value;
    if (theme === "light" || theme === "dark") {
      localStorage.setItem(localStorageKeys.theme, theme);
    } else {
      localStorage.removeItem(localStorageKeys.theme);
    }
    updateTheme(getTheme());
  });
};
const initEditor = (selectId, editorId, npmId, keyLang, defaultLang) => {
  const selectEl = document.querySelector(`#${selectId}`);
  if (!(selectEl instanceof HTMLSelectElement)) {
    throw new Error(`no #${selectId}`);
  }
  const editorEl = document.querySelector(`#${editorId}`);
  if (!(editorEl instanceof HTMLElement)) {
    throw new Error(`no #${editorId}`);
  }
  const npmEl = document.querySelector(`#${npmId}`);
  if (!(npmEl instanceof HTMLAnchorElement)) {
    throw new Error(`no #${npmId}`);
  }
  const npmIconEl = npmEl.querySelector(`img`);
  if (!(npmIconEl instanceof HTMLImageElement)) {
    throw new Error(`no #${npmId} img`);
  }
  const editor = monaco.editor.create(editorEl, {
    value: "",
    language: "json",
    theme: getMonacoTheme(getTheme())
  });
  return {
    selectEl,
    editorEl,
    npmEl,
    npmIconEl,
    editor,
    keyLang,
    defaultLang
  };
};
const setLang = (set, lang) => {
  if (set.selectEl.value !== lang)
    set.selectEl.value = lang;
  const alt = altJSONs.find((a) => a.name === lang);
  const model = set.editor.getModel();
  if (!model)
    return;
  if (alt && alt.packageName) {
    set.npmEl.title = alt.packageName;
    set.npmEl.href = `https://npmjs.com/package/${alt.packageName}`;
    monaco.editor.setModelLanguage(model, alt.id);
  } else {
    set.npmEl.removeAttribute("title");
    set.npmEl.removeAttribute("href");
  }
  localStorage.setItem(set.keyLang, lang);
};
const getLang = (set) => {
  return set.selectEl.value;
};
const updateErrors = (set) => {
  const model = set.editor.getModel();
  if (!model)
    return null;
  const lang = getLang(set);
  const code = model.getValue();
  monaco.editor.setModelMarkers(model, parserOwner, []);
  try {
    return JSON.stringify(convertFrom(lang, code));
  } catch (e) {
    monaco.editor.setModelMarkers(model, parserOwner, [
      {
        severity: monaco.MarkerSeverity.Error,
        message: String(e),
        startLineNumber: 1,
        endLineNumber: model.getLineCount(),
        startColumn: 0,
        endColumn: 0
      }
    ]);
    return null;
  }
};
const main = async () => {
  initTheme();
  greeting();
  let lastValid = localStorage.getItem(localStorageKeys.lastValid);
  let lastLang = localStorage.getItem(localStorageKeys.lastLang);
  let lastCode = localStorage.getItem(localStorageKeys.lastCode);
  if (lastValid === null) {
    lastValid = JSON.stringify(defaultJSON, void 0, 2);
  }
  expose({monaco});
  initMonaco();
  initAltJSONOptions();
  const left = initEditor("left-select", "left", "left-npm", localStorageKeys.leftLang, "json");
  const right = initEditor("right-select", "right", "right-npm", localStorageKeys.rightLang, "yaml");
  const {editor: editorLeft} = left;
  const {editor: editorRight} = right;
  const update = (set) => {
    const model = set.editor.getModel();
    if (!model)
      return;
    try {
      const lang = getLang(set);
      if (lastLang === lang && lastCode !== null) {
        model.setValue(lastCode);
        return;
      }
      if (lastValid === null)
        return;
      const lastJSON = (() => {
        try {
          return JSON.parse(lastValid);
        } catch (e) {
          if (__SNOWPACK_ENV__.MODE === "development") {
            console.error(e);
          }
          return defaultJSON;
        }
      })();
      const code = (() => {
        try {
          return convertTo(lastJSON, set.selectEl.value);
        } catch (e) {
          if (__SNOWPACK_ENV__.MODE === "development") {
            console.error(e);
          }
          return `Error while converting JSON to string:
${e}`;
        }
      })();
      model.setValue(code);
    } catch (e) {
      if (__SNOWPACK_ENV__.MODE === "development") {
        console.error(e);
      }
    }
  };
  expose({editorLeft, editorRight});
  let handling = false;
  [
    [left, right],
    [right, left]
  ].forEach(([set, another]) => {
    {
      handling = true;
      try {
        const lang = localStorage.getItem(set.keyLang);
        if (lang === null) {
          setLang(set, set.defaultLang);
        } else {
          setLang(set, lang);
        }
        update(set);
        updateErrors(set);
      } catch (e) {
        if (__SNOWPACK_ENV__.MODE === "development") {
          console.error(e);
        }
      } finally {
        handling = false;
      }
    }
    set.editor.onDidChangeModelContent(() => {
      if (handling)
        return;
      handling = true;
      try {
        const model = set.editor.getModel();
        if (!model)
          return;
        const lang = getLang(set);
        const code = model.getValue();
        lastLang = lang;
        lastCode = code;
        localStorage.setItem(localStorageKeys.lastLang, lastLang);
        localStorage.setItem(localStorageKeys.lastCode, lastCode);
        const valid = updateErrors(set);
        if (valid === null)
          return;
        lastValid = valid;
        localStorage.setItem(localStorageKeys.lastValid, lastValid);
        update(another);
      } finally {
        handling = false;
      }
    });
    set.selectEl.addEventListener("change", () => {
      if (handling)
        return;
      handling = true;
      try {
        const lang = getLang(set);
        setLang(set, lang);
        update(set);
      } finally {
        handling = false;
      }
    });
  });
  window.onresize = () => {
    editorLeft.layout();
    editorRight.layout();
  };
  exposeAllAltJSONs();
};
void main();
