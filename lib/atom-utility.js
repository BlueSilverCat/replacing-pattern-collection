'use babel';

import { setEventListenerClickAndEnter } from './utility'

export function makeMiniEditor(text) {
  let editor = atom.workspace.buildTextEditor();

  editor.mini = true;
  editor.tabLength = 2;
  editor.softTabs = true;
  editor.softWrapped = false;
  //editor.buffer = new TextBuffer();
  editor.setText(text);
  return editor;
}

export function makeMiniEditorWithView(text, cla) {
  let editor = makeMiniEditor(text);

  editor.view = atom.views.getView(editor);
  for (let i = 0; i < cla.length; ++i) {
    editor.view.classList.add(cla[i]);
  }
  return editor;
}

// for atom
export function getActivatePackage(packageName) {
  let pack = atom.packages.getActivePackage(packageName);

  if(!pack){
    pack = atom.packages.enablePackage(packageName);
  }
  return pack;
}

export function makeToggleBtn(ele, callback) {
  let func = attachToggle(ele, callback);

  return setEventListenerClickAndEnter(ele, func, false);
}

//現在の状態をボタンの見た目に反映させる
export function toggleBtn(ele, state) {
  const btn = "btn";
  const sel = "selected";

  if(ele.classList.contains(btn)) {
    if(state) {
      ele.classList.add(sel);
    } else {
      ele.classList.remove(sel);
    }
  }
}

//ボタンを押された時の処理を返す
function attachToggle(ele, callback) {
  return (evt) => {
    if(checkEventClickOrEnter(evt) === false){
      return;
    }

    const btn = "btn";
    const sel = "selected";

    if(ele.classList.contains(btn)) {
      if(ele.classList.contains(sel)) {
        ele.classList.remove(sel);
        callback(false);
        return;
      }
      ele.classList.add(sel);
      callback(true);
      return;
    }
  };
}

export function editorDidChange(editor, target, property) {
  return (evt) => {
    target[property] = editor.getText();
  };
}

export function getConfig(configName, func, subscriptions) {
  subscriptions.add(atom.config.onDidChange(configName, func));
  return atom.config.get(configName);
}

export function checkEventClickOrEnter(evt) {
  if(evt.type === 'click') {
    return true;
  }
  if(evt.type === 'keydown') {
    let keyStroke = atom.keymaps.keystrokeForKeyboardEvent(evt);

    if(keyStroke === 'enter') {
      return true;
    }
  }
  return false;
}

export function getConfigAndSetOnDidChange(configName, subscriptions, callback) {
  subscriptions.add(atom.config.onDidChange(configName, callback));
  return atom.config.get(configName);
}

//config などが変更された時に呼び出だされる関数を返す
export function setChangedConfig(target, property) {
  return (evt) => {
    target[property] = evt.newValue;
  }
}
