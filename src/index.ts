import * as monaco from 'monaco-editor';
import initMonaco from './lib/monaco/init';
import initAltJSONOptions from './lib/alt-json-options/init';

const initLeft = () => {
  const el = document.querySelector('#left');
  if (!(el instanceof HTMLElement)) {
    throw new Error('no #left');
  }

  const editor = monaco.editor.create(el, {
    value: JSON.stringify({ hello: 'world' }, null, 2),
    language: 'json',
  });

  return { el, editor };
};

const initRight = () => {
  const el = document.querySelector('#right');
  if (!(el instanceof HTMLElement)) {
    throw new Error('no #right');
  }

  const editor = monaco.editor.create(el, {
    value: JSON.stringify({ hello: 'world' }, null, 2),
    language: 'json',
  });

  return { el, editor };
};

const main = async () => {
  initMonaco();
  initAltJSONOptions();

  const { editor: editorLeft } = initLeft();
  const { editor: editorRight } = initRight();

  window.onresize = () => {
    editorLeft.layout();
    editorRight.layout();
  };
};

void main();
