'use babel';

import RPCV from './replacing-pattern-collection-view';
import { CompositeDisposable } from 'atom';
import { getActivatePackage, getConfig } from './atom-utility';
import { readFromCson, writeToCson, RPCFindOptions } from './cson-file';

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

  kFAndR: 'find-and-replace',
  kFandRToggle: 'find-and-replace:toggle',
  kFAndRShow: 'find-and-replace:show',
  kPFShow: 'project-find:show',

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'replacing-pattern-collection:toggle': () => this.toggle()
    }));

    atom.commands.dispatch(atom.views.getView(atom.workspace.getActiveTextEditor()), this.kFandRToggle);
    atom.commands.dispatch(atom.views.getView(atom.workspace.getActiveTextEditor()), this.kFandRToggle);
    if(!this.fAndRPackage) {
      this.fAndRPackage = getActivatePackage(this.kFAndR);
      if(!this.fAndRPackage) {
        return;
      }
      this.fAndRModule = this.fAndRPackage.mainModule;
    }

    this.filePath = getConfig(this.name + '.defaultFilePath', this.getFilePath(), this.subscriptions);
    this.read()();

    this.view = new RPCV(state.RPCVS);
    //this.modalPanel = atom.workspace.addTopPanel({
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.view.getElement(),
      visible: false
    });
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.view.destroy();
  },

  serialize() {
    return {
      RPCVS: this.view.serialize()
    };
  },

  toggle() {
    //console.log('toggle');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  },

  find(option) {
    //console.log('find');
    atom.commands.dispatch(atom.views.getView(atom.workspace.getActiveTextEditor()), this.kFAndRShow);

    this.setOptionToFAndR(option);
    this.fAndRModule.findView.replaceEditor.setText(option.replacePattern);
    atom.commands.dispatch(this.fAndRModule.findView.findEditor.element, 'core:move-down');
    atom.commands.dispatch(this.fAndRModule.findView.findEditor.element, 'core:confirm');
    atom.commands.dispatch(this.fAndRModule.findView.findEditor.element, 'core:move-up');
    this.fAndRModule.findView.findEditor.setText(option.findPattern);
  },

  projectFind(option) {
    //console.log('projectFind');
    atom.commands.dispatch(atom.views.getView(atom.workspace.getActiveTextEditor()), this.kPFShow);
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
      console.log(err);
    };
  },

  getFindOptions() {
    return () => {
      //console.log("getFindOptions", this);
      if(!this.fAndRModule.findView.panel.visible && !this.fAndRModule.projectFindView.panel.visible) {
        return;
      }
      let tempOption = new RPCFindOptions(this.fAndRModule.findOptions);
      if(this.fAndRModule.findView.panel.visible) {
        tempOption.projectFind = false;
        this.fAndRModule.findView.findEditor.getText(tempOption.findPattern);
        this.fAndRModule.findView.replaceEditor.getText(tempOption.replacePattern);
      } else {
        //console.log("projectFind");
        tempOption.projectFind = true;
        this.fAndRModule.projectFindView.findEditor.getText(tempOption.findPattern);
        this.fAndRModule.projectFindView.replaceEditor.getText(tempOption.replacePattern);
        this.fAndRModule.projectFindView.pathsEditor.getText(tempOption.pathsPattern);
      }
      this.findOptions.push(tempOption);
      this.view.makeLiElement([tempOption], true);
    }
  },

  setOptionToFAndR(option) {
    let temp = {};

    Object.assign(temp, option);
    delete temp.projectFind;
    this.fAndRModule.findOptions.set(temp);
  },

  read() {
    return ()=> {
      readFromCson(this.filePath, this.name, this.setFindOptions(), this.failed());
    }
  },

  write() {
    return () => {
      let obj = {};
      obj[this.name] = {};
      obj[this.name].options = this.findOptions;
      writeToCson(this.filePath, obj, this.none(), this.failed());
    }
  },

  getFilePath(){
    return (evt)=> {
      this.filePath = evt.newValue;
    }
  },

  none() {
    return () => {
    }
  }
};
