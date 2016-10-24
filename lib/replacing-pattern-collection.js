'use babel';

import RPCV from './replacing-pattern-collection-view';
import { CompositeDisposable } from 'atom';
import { getActivatePackage, getConfig } from './atom-utility';
import { readFromCson, writeToCson, RPCFindOptions } from './cson-file';
import { setEventListener, disposeEventListeners } from './utility';

export default {
  config: {
    defaultFilePath: {
      type: 'string',
      description: "Specify the CSON file that describing patterns.",
      'default': ''
    }
  },

  name: 'replacing-pattern-collection',
  replacingPatternCollectionView: null,
  modalPanel: null,
  subscriptions: null,

  filePath: "",
  fAndRPackage: null,
  fAndRModule: null,
  findOptions: [],
  keyDownSubsription: null,

  kFAndR: 'find-and-replace',
  kFandRToggle: 'find-and-replace:toggle',
  kFAndRShow: 'find-and-replace:show',
  kPFShow: 'project-find:show',

  activate() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'replacing-pattern-collection:toggle': () => this.toggle()
    }));

    this.filePath = getConfig(this.name + '.defaultFilePath', this.getFilePath(), this.subscriptions);
    this.read();

    this.getFAndRPackage();
    this.subscriptions.add(atom.commands.add(this.view.rootElement, {
      //'replacing-pattern-collection:goto': (evt) => this.goto(evt),
      'replacing-pattern-collection:next': (evt) => this.view.focusNext(evt),
      'replacing-pattern-collection:previous': (evt) => this.view.focusPrevious(evt),
      'replacing-pattern-collection:nextSetButton': (evt) => this.view.focusNextSetButton(evt),
      'replacing-pattern-collection:previousSetButton': (evt) => this.view.focusPreviousSetButton(evt)
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.view.destroy();
  },

  toggle() {
    //console.log('toggle');
    this.getFAndRPackage();
    if(this.fAndRPackage) {
      if(this.modalPanel.isVisible()) {
        this.hidePanel();
      } else {
        this.modalPanel.show();
        this.view.rootElement.focus();
        //keymapsにescapeを登録した場合は、フォーカスが外れると閉じないのでこちらの方が確実
        this.keyDownSubsription = setEventListener(document, 'keydown', this.keyDownEscape(), true);
      }
    }
  },

  find(option) {
    //console.log('find');
    atom.commands.dispatch(atom.views.getView(atom.workspace.getActivePaneItem()), this.kFAndRShow);

    this.setOptionToFAndR(option);
    this.fAndRModule.findView.replaceEditor.setText(option.replacePattern);
    atom.commands.dispatch(this.fAndRModule.findView.findEditor.element, 'core:move-down');
    atom.commands.dispatch(this.fAndRModule.findView.findEditor.element, 'core:confirm');
    atom.commands.dispatch(this.fAndRModule.findView.findEditor.element, 'core:move-up');
    this.fAndRModule.findView.findEditor.setText(option.findPattern);
  },

  projectFind(option) {
    //console.log('projectFind');
    atom.commands.dispatch(atom.views.getView(atom.workspace.getActivePaneItem()), this.kPFShow);
    this.setOptionToFAndR(option);
    this.fAndRModule.projectFindView.findEditor.setText(option.findPattern);
    this.fAndRModule.projectFindView.replaceEditor.setText(option.replacePattern);
    this.fAndRModule.projectFindView.pathsEditor.setText(option.pathsPattern);
  },

  setFindOptions() {
    return (findOptions) => {
      this.findOptions = findOptions;
      this.view.makeLiElement(findOptions, false);
    };
  },

  failed() {
    return (err) => {
      atom.notifications.addWarning('defaultFilePath is not valid file', {detail: err, dissmiss: true});
    };
  },

  getFindOptions() {
    if(!this.fAndRModule.findView.panel.visible && !this.fAndRModule.projectFindView.panel.visible) {
      return;
    }
    let tempOption = new RPCFindOptions(this.fAndRModule.findOptions);

    if(this.fAndRModule.findView.panel.visible) {
      tempOption.projectFind = false;
      tempOption.findPattern = this.fAndRModule.findView.findEditor.getText();
      tempOption.replacePattern = this.fAndRModule.findView.replaceEditor.getText();
      //getTextだと、再起動前のデータを取ってきてしまう?
      /*tempOption.findPattern = this.fAndRModule.findView.findEditor.model.buffer.cachedText ?
        this.fAndRModule.findView.findEditor.model.buffer.cachedText : '';
      tempOption.replacePattern = this.fAndRModule.findView.replaceEditor.model.buffer.cachedText ?
        this.fAndRModule.findView.replaceEditor.model.buffer.cachedText : '' ;*/
    } else {
      //console.log("projectFind");
      tempOption.projectFind = true;
      tempOption.findPattern = this.fAndRModule.projectFindView.findEditor.getText();
      tempOption.replacePattern = this.fAndRModule.projectFindView.replaceEditor.getText();
      tempOption.pathsPattern = this.fAndRModule.projectFindView.pathsEditor.getText();

      /*tempOption.findPattern = this.fAndRModule.projectFindView.findEditor.model.buffer.cachedText ?
        this.fAndRModule.projectFindView.findEditor.model.buffer.cachedText : '';
      tempOption.replacePattern = this.fAndRModule.projectFindView.replaceEditor.model.buffer.cachedText ?
        this.fAndRModule.projectFindView.replaceEditor.model.buffer.cachedText : '' ;
      tempOption.pathsPattern = this.fAndRModule.projectFindView.pathsEditor.model.buffer.cachedText ?
        this.fAndRModule.projectFindView.pathsEditor.model.buffer.cachedText : '';*/
    }
    this.findOptions.push(tempOption);
    this.view.makeLiElement([tempOption], true);
    this.view.viewElements[this.view.viewElements.length -1].discriptionEditor.view.focus();
  },

  setOptionToFAndR(option) {
    let temp = {};

    Object.assign(temp, option);
    delete temp.discription;
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
    writeToCson(this.filePath, obj, this.none(), this.failed());
  },

  getFilePath(){
    return (evt)=> {
      this.filePath = evt.newValue;
      this.view.filePathEditor.setText(this.filePath);
      this.read();
    }
  },

  getFAndRPackage() {
    if(!this.fAndRPackage) {
      this.fAndRPackage = getActivatePackage(this.kFAndR);
      if(!this.fAndRPackage) {
        return;
      }
      atom.commands.dispatch(atom.views.getView(atom.workspace.getActivePaneItem()), this.kFandRToggle);
      atom.commands.dispatch(atom.views.getView(atom.workspace.getActivePaneItem()), this.kFandRToggle);
      this.fAndRModule = this.fAndRPackage.mainModule;
      this.makeView();
    }
  },

  makeView () {
    this.view = new RPCV();
    //this.modalPanel = atom.workspace.addTopPanel({
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.view.getElement(),
      visible: false,
      className: this.name
    });
  },

  none() {
    return () => {
    }
  },

  keyDownEscape() {
    return (evt) => {
      let keystroke = atom.keymaps.keystrokeForKeyboardEvent(evt);

      if(keystroke === 'escape') {
        this.hidePanel();
      }
    };
  },

  hidePanel() {
    this.modalPanel.hide();
    if(this.keyDownSubsription !== null) {
      disposeEventListeners([this.keyDownSubsription]);
      this.keyDownSubsription = null;
    }
  }
};
