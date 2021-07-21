import registerArcLanguage from './languages/arc';
import registerJSON5Language from './languages/json5';
import registerJSONCLanguage from './languages/jsonc';
import registerTOMLLanguage from './languages/toml';
import { registerDarkTheme } from './themes/dark';
import { registerLightTheme } from './themes/light';

const initMonaco = (): void => {
  window.MonacoEnvironment = {
    getWorkerUrl(_moduleId, label) {
      if (label === 'json') {
        return '/monaco-editor/esm/vs/language/json/json.worker.js';
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return '/monaco-editor/esm/vs/language/css/css.worker.js';
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return '/monaco-editor/esm/vs/language/html/html.worker.js';
      }
      if (label === 'typescript' || label === 'javascript') {
        return '/monaco-editor/esm/vs/language/typescript/ts.worker.js';
      }
      return '/monaco-editor/esm/vs/editor/editor.worker.js';
    },
  };

  registerArcLanguage();
  registerTOMLLanguage();
  registerJSON5Language();
  registerJSONCLanguage();

  registerLightTheme();
  registerDarkTheme();
};

export default initMonaco;
