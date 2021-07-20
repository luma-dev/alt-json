import * as monaco from 'monaco-editor';
import initMonaco from './lib/monaco/init';
import initAltJSONOptions from './lib/alt-json-options/init';
import altJSONs from './lib/alt-json';
import { expose, exposeAllAltJSONs, greeting } from './greeting';

const parserOwner = 'alt-json';
const defaultJSON: ReadonlyJSONValue = {
  hello: [
    {
      world: ['world', 'from'],
    },
  ],
  your: [
    {
      hands: {
        in: 'seconds.',
      },
    },
  ],
};

const localStorageKeys = Object.freeze({
  leftLang: 'leftLang',
  rightLang: 'rightLang',
  lastLang: 'lastLang',
  lastCode: 'lastCode',
});

const convertFrom = (langFrom: string, str: string): JSONValue => {
  const altFrom = altJSONs.find(a => a.name === langFrom);
  if (!altFrom) throw new Error(`langFrom=${langFrom} not defined`);
  const from = altFrom.toJSON(str);
  return from;
};

const convertTo = (json: ReadonlyJSONValue, langTo: string): string => {
  const altTo = altJSONs.find(a => a.name === langTo);
  if (!altTo) throw new Error(`langTo=${langTo} not defined`);
  const to = altTo.fromJSON(json);
  return to;
};

interface EditorSet {
  selectEl: HTMLSelectElement;
  editorEl: HTMLElement;
  editor: monaco.editor.IStandaloneCodeEditor;
  keyLang: string;
  defaultLang: string;
}

const initEditor = (selectId: string, editorId: string, keyLang: string, defaultLang: string): EditorSet => {
  const selectEl = document.querySelector(`#${selectId}`);
  if (!(selectEl instanceof HTMLSelectElement)) {
    throw new Error(`no #${selectId}`);
  }

  const editorEl = document.querySelector(`#${editorId}`);
  if (!(editorEl instanceof HTMLElement)) {
    throw new Error(`no #${editorId}`);
  }

  const editor = monaco.editor.create(editorEl, {
    value: '',
    language: 'json',
  });

  return {
    selectEl,
    editorEl,
    editor,
    keyLang,
    defaultLang,
  };
};

const setLang = (set: EditorSet, lang: string): void => {
  // eslint-disable-next-line no-param-reassign
  set.selectEl.value = lang;
  const model = set.editor.getModel();
  if (!model) return;
  monaco.editor.setModelLanguage(model, lang);
};

const getLang = (set: EditorSet): string => {
  return set.selectEl.value;
};

const main = async () => {
  greeting();

  let lastLang: string | null = localStorage.getItem(localStorageKeys.lastLang);
  let lastCode: string | null = localStorage.getItem(localStorageKeys.lastCode);

  if (lastLang === null || lastCode === null) {
    lastLang = 'json';
    lastCode = JSON.stringify(defaultJSON, undefined, 2);
  }

  expose({ monaco });
  initMonaco();
  initAltJSONOptions();

  const left = initEditor('left-select', 'left', localStorageKeys.leftLang, 'json');
  const right = initEditor('right-select', 'right', localStorageKeys.rightLang, 'yaml');
  const { editor: editorLeft } = left;
  const { editor: editorRight } = right;

  const update = (set: EditorSet) => {
    const model = set.editor.getModel();
    if (!model) {
      if (import.meta.env.MODE === 'development') {
        // eslint-disable-next-line no-console
        console.warn('No model.');
      }
      return;
    }
    if (lastLang === null) return;
    if (lastCode === null) return;
    try {
      if (lastLang === getLang(set)) {
        model.setValue(lastCode);
      } else {
        const lastJSON = (() => {
          try {
            return convertFrom(lastLang, lastCode);
          } catch (e: unknown) {
            if (import.meta.env.MODE === 'development') {
              // eslint-disable-next-line no-console
              console.error(e);
            }
            return defaultJSON;
          }
        })();
        const code = (() => {
          try {
            return convertTo(lastJSON, set.selectEl.value);
          } catch (e: unknown) {
            if (import.meta.env.MODE === 'development') {
              // eslint-disable-next-line no-console
              console.error(e);
            }
            return `Error while converting JSON to string:\n${e}`;
          }
        })();
        model.setValue(code);
      }
    } catch (e: unknown) {
      if (import.meta.env.MODE === 'development') {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  };

  expose({ editorLeft, editorRight });

  let handling = false;
  [
    [left, right],
    [right, left],
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
      } catch (e: unknown) {
        if (import.meta.env.MODE === 'development') {
          // eslint-disable-next-line no-console
          console.error(e);
        }
      } finally {
        handling = false;
      }
    }

    set.editor.onDidChangeModelContent(() => {
      if (handling) return;
      handling = true;
      try {
        const model = set.editor.getModel();
        if (!model) return;
        const lang = getLang(set);
        const code = model.getValue();
        monaco.editor.setModelMarkers(model, parserOwner, []);
        try {
          convertFrom(lang, code);
        } catch (e: unknown) {
          monaco.editor.setModelMarkers(model, parserOwner, [
            {
              severity: monaco.MarkerSeverity.Error,
              message: String(e),
              startLineNumber: 1,
              endLineNumber: model.getLineCount(),
              startColumn: 0,
              endColumn: 0,
            },
          ]);
          return;
        }
        lastLang = lang;
        lastCode = code;
        localStorage.setItem(localStorageKeys.lastLang, lastLang);
        localStorage.setItem(localStorageKeys.lastCode, lastCode);
        update(another);
      } finally {
        handling = false;
      }
    });

    set.selectEl.addEventListener('change', () => {
      if (handling) return;
      handling = true;
      try {
        const lang = getLang(set);
        localStorage.setItem(set.keyLang, lang);
        const model = set.editor.getModel();
        if (!model) return;
        monaco.editor.setModelLanguage(model, lang);
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
