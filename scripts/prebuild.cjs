const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const isProd = process.env.NODE_ENV === 'production';

const staticDir = path.resolve(__dirname, '../_prebuild_static');
const dynamicDir = path.resolve(__dirname, '../_prebuild_dynamic');

const clean = async () => {
  await fs.promises.rmdir(staticDir, { recursive: true });
  await fs.promises.rmdir(dynamicDir, { recursive: true });
};

const main = async () => {
  await clean();
  await fs.promises.mkdir(staticDir, { recursive: true });

  await esbuild.build({
    entryPoints: [
      path.resolve(__dirname, '../node_modules/monaco-editor/esm/vs/editor/editor.worker.js'),
      path.resolve(__dirname, '../node_modules/monaco-editor/esm/vs/language/json/json.worker.js'),
      path.resolve(__dirname, '../node_modules/monaco-editor/esm/vs/language/css/css.worker.js'),
      path.resolve(__dirname, '../node_modules/monaco-editor/esm/vs/language/html/html.worker.js'),
      path.resolve(__dirname, '../node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js'),
    ],
    outdir: path.resolve(staticDir, 'monaco-editor/esm/vs'),
    bundle: true,
    minify: isProd,
    sourcemap: isProd ? false : 'inline',
  });

  await esbuild.build({
    entryPoints: [
      path.resolve(__dirname, '../node_modules/js-hcl-parser/dist/hcl.js'),
    ],
    outdir: path.resolve(dynamicDir, 'js-hcl-parser/dist'),
    format: 'esm',
    bundle: true,
    minify: isProd,
    sourcemap: isProd ? false : 'inline',
  });

  await fs.promises.copyFile(path.resolve(__dirname, '../node_modules/monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.ttf'), path.resolve(staticDir, 'codicon.ttf'));

  const sync = async (toDir, copyFromRoot, copyFrom) => {
    const rel = path.relative(copyFromRoot, copyFrom);
    const to = path.resolve(toDir, rel);
    if ((await fs.promises.stat(copyFrom)).isFile()) {
      await fs.promises.mkdir(path.dirname(to), { recursive: true });
      await fs.promises.copyFile(copyFrom, to);
    } else {
      (await fs.promises.readdir(copyFrom)).map(async (f) => {
        await sync(toDir, copyFromRoot, path.resolve(copyFrom, f));
      });
    }
  };

  await sync(
    dynamicDir,
    path.resolve(__dirname, '../prebuild_types'),
    path.resolve(__dirname, '../prebuild_types'),
  );
};

void main();
