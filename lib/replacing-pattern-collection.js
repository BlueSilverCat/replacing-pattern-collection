"use babel";

import { RPCFindOptions, readFromCson, writeToCson } from "./cson-file";
import { disposeEventListeners, setEventListener } from "./utilities/html-utility";
import { getActivatePackage, getConfig } from "./utilities/atom-utility";
import { CompositeDisposable } from "atom";
import RPCV from "./replacing-pattern-collection-view";

export default {
  "config": {
    "defaultFilePath": {
      "type": "string",
      "description": "Specify the CSON file that describing patterns.",
      "default": "",
    },
  },

  "name": "replacing-pattern-collection",
  "replacingPatternCollectionView": null,
  "modalPanel": null,
  "subscriptions": null,

  "filePath": "",
  "fAndRPackage": null,
  "fAndRModule": null,
  "keyDownSubsription": null,

  "kFAndR": "find-and-replace",
  "kFandRToggle": "find-and-replace:toggle",
  "kFAndRShow": "find-and-replace:show",
  "kPFShow": "project-find:show",

  activate() {
    this.subscriptions = new CompositeDisposable();
    this.filePath = getConfig(`${this.name}.defaultFilePath`, this.getFilePath(), this.subscriptions);
    this.read();

    this.findOptions = [new RPCFindOptions()];
    this.getFAndRPackage();

    this.subscriptions.add(atom.commands.add("atom-workspace", {
      "replacing-pattern-collection:toggle": () => { this.toggle(); },
      "replacing-pattern-collection:settings": () => { this.settings(); },
    }));

    //引数を与えないといけないので変数に代入している?
    let nextFunc = this.view.move("next");
    let lastFunc = this.view.move("last");
    let previousFunc = this.view.move("previous");
    let firstFunc = this.view.move("first");
    let setFunc = this.view.set();
    this.subscriptions.add(atom.commands.add(this.view.rootElement, {
      "replacing-pattern-collection:focusNext": (evt) => { this.view.focusNext(evt); },
      "replacing-pattern-collection:focusPrevious": (evt) => { this.view.focusPrevious(evt); },
      "replacing-pattern-collection:next": (evt) => { nextFunc(evt); },
      "replacing-pattern-collection:last": (evt) => { lastFunc(evt); },
      "replacing-pattern-collection:previous": (evt) => { previousFunc(evt); },
      "replacing-pattern-collection:first": (evt) => { firstFunc(evt); },
      "replacing-pattern-collection:set": (evt) => { setFunc(evt); },
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.view.destroy();
  },

  /*
  commands
  //*/

  toggle() {
    this.getFAndRPackage();
    if (this.fAndRPackage) {
      if (this.modalPanel.isVisible()) {
        this.hidePanel();
      } else {
        this.modalPanel.show();
        this.view.setButton.focus();
        //keymapsにescapeを登録した場合は、フォーカスが外れると閉じないのでこちらの方が確実
        this.keyDownSubsription = setEventListener(document, "keydown", this.keyDownEscape(), true);
      }
    }
  },

  settings() {
    atom.workspace.open(`atom://config/packages/${this.name}`);
  },

  open() {
    atom.workspace.open(this.filePath);
    this.hidePanel();
  },

  find(option) {
    atom.commands.dispatch(atom.views.getView(atom.workspace.getActivePaneItem()), this.kFAndRShow);

    this.setOptionToFAndR(option);
    this.fAndRModule.findView.replaceEditor.setText(option.replacePattern);
    atom.commands.dispatch(this.fAndRModule.findView.findEditor.element, "core:move-down");
    atom.commands.dispatch(this.fAndRModule.findView.findEditor.element, "core:confirm");
    atom.commands.dispatch(this.fAndRModule.findView.findEditor.element, "core:move-up");
    this.fAndRModule.findView.findEditor.setText(option.findPattern);
  },

  projectFind(option) {
    atom.commands.dispatch(atom.views.getView(atom.workspace.getActivePaneItem()), this.kPFShow);
    this.setOptionToFAndR(option);
    this.fAndRModule.projectFindView.findEditor.setText(option.findPattern);
    this.fAndRModule.projectFindView.replaceEditor.setText(option.replacePattern);
    this.fAndRModule.projectFindView.pathsEditor.setText(option.pathsPattern);
  },

  setFindOptions() {
    return (findOptions) => {
      if (findOptions.length === 0) {
        this.findOptions = [new RPCFindOptions()];
      } else {
        this.findOptions = findOptions;
      }
      this.view.updateView(0);
    };
  },

  failed() {
    return (err) => {
      atom.notifications.addWarning("FilePath is not valid file", { "detail": err, "dissmiss": true });
    };
  },

  getFindOptions() {
    if (!this.fAndRModule.findView.panel.visible && !this.fAndRModule.projectFindView.panel.visible) {
      return;
    }
    let tempOption = new RPCFindOptions(this.fAndRModule.findOptions);

    if (this.fAndRModule.findView.panel.visible) {
      tempOption.projectFind = false;
      tempOption.findPattern = this.fAndRModule.findView.findEditor.getText();
      tempOption.replacePattern = this.fAndRModule.findView.replaceEditor.getText();
      tempOption.pathsPattern = "";
    } else {
      tempOption.projectFind = true;
      tempOption.findPattern = this.fAndRModule.projectFindView.findEditor.getText();
      tempOption.replacePattern = this.fAndRModule.projectFindView.replaceEditor.getText();
      tempOption.pathsPattern = this.fAndRModule.projectFindView.pathsEditor.getText();
    }
    this.findOptions.push(tempOption);
    this.view.updateView(this.findOptions.length - 1);
    this.view.descriptionInput.focus();
  },

  setOptionToFAndR(option) {
    let temp = {};

    Object.assign(temp, option);
    delete temp.description;
    delete temp.projectFind;
    this.fAndRModule.findOptions.set(temp);
  },

  read() {
    readFromCson(this.filePath, this.name, this.setFindOptions(), this.failed());
  },

  write() {
    let obj = {};

    obj[this.name] = {};
    obj[this.name].options = this.findOptions;
    writeToCson(this.filePath, obj, this.writeSuccess(), this.failed());
  },

  getFilePath() {
    return (evt) => {
      this.filePath = evt.newValue;
      this.view.filePathInput.value = this.filePath;
      this.read();
    };
  },

  getFAndRPackage() {
    if (!this.fAndRPackage) {
      this.fAndRPackage = getActivatePackage(this.kFAndR);
      if (!this.fAndRPackage) {
        return;
      }
      atom.commands.dispatch(atom.views.getView(atom.workspace.getActivePaneItem()), this.kFandRToggle);
      atom.commands.dispatch(atom.views.getView(atom.workspace.getActivePaneItem()), this.kFandRToggle);
      this.fAndRModule = this.fAndRPackage.mainModule;
      this.makeView();
    }
  },

  makeView() {
    this.view = new RPCV();
    this.modalPanel = atom.workspace.addModalPanel({
      "item": this.view.getElement(),
      "visible": false,
      "className": this.name,
    });
  },

  writeSuccess() {
    return () => {
      atom.notifications.addSuccess("Write to file was successful", { "detail": this.filePath, "dissmiss": true });
    };
  },

  keyDownEscape() {
    return (evt) => {
      let keystroke = atom.keymaps.keystrokeForKeyboardEvent(evt);

      if (keystroke === "escape") {
        this.hidePanel();
      }
    };
  },

  hidePanel() {
    this.modalPanel.hide();
    if (this.keyDownSubsription !== null) {
      disposeEventListeners([this.keyDownSubsription]);
      this.keyDownSubsription = null;
    }
  },
};
