'use babel';

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
// for atom
export function getActivatePackage(packageName) {
  let pack = atom.packages.getActivePackage(packageName);

  if(!pack){
    pack = atom.packages.enablePackage(packageName);
  }
  return pack;
}

export function makeToggleBtn(ele, state, callback) {
  toggleBtn(ele, state);
  let func = attachToggle(ele, callback);
  ele.addEventListener("click", func, false);
  return [ele, "click", func];
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
export function attachToggle(ele, callback) {
  return () => {
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
  return () => {
    target[property] = editor.getText();
  };
}

export function getConfig(configName, func, subscriptions) {
  subscriptions.add(atom.config.onDidChange(configName, func));
  return atom.config.get(configName);
}
