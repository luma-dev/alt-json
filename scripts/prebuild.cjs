const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const isProd = process.env.NODE_ENV === 'production';

const distDir = path.resolve(__dirname, '../prebuild');

const clean = async () => {
  await fs.promises.rmdir(distDir, { recursive: true });
};

const main = async () => {
  await clean();
  const outdir = path.resolve(distDir);
  await fs.promises.mkdir(outdir, { recursive: true });

  await esbuild.build({
    entryPoints: [
      path.resolve(__dirname, '../node_modules/monaco-editor/esm/vs/editor/editor.worker.js'),
      path.resolve(__dirname, '../node_modules/monaco-editor/esm/vs/language/json/json.worker.js'),
      path.resolve(__dirname, '../node_modules/monaco-editor/esm/vs/language/css/css.worker.js'),
      path.resolve(__dirname, '../node_modules/monaco-editor/esm/vs/language/html/html.worker.js'),
      path.resolve(__dirname, '../node_modules/js-hcl-parser/dist/hcl.js'),
    ],
    outdir,
    bundle: true,
    minify: isProd,
    sourcemap: isProd ? false : 'inline',
  });

  await fs.promises.copyFile(path.resolve(__dirname, '../node_modules/monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.ttf'), path.resolve(distDir, 'codicon.ttf'));

  const copyDir = async (rootFrom, from, to) => {
    (await fs.promises.readdir(from)).map(async (f) => {
      if ((await fs.promises.stat(f)).isFile()) {
        const r = path.relativ(rootFrom, path.relative(rootFrom, path.join(from, f)));
        await fs.promises.copyFile(r);
      } else {
        await copyDir(rootFrom, path.resolve(from, f));
      }
    });
  };
  const typesDir = path.resolve(__dirname, 'prebuild-types');
  copyDir(typesDir, typesDir, distDir);
  await fs.promises.copyFile(path.resolve(__dirname, '../node_modules/monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.ttf'), path.resolve(distDir, 'codicon.ttf'));
};

void main();
