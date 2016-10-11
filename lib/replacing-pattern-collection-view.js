'use babel';

import RPC from './replacing-pattern-collection';
import { CompositeDisposable } from 'atom';
import { createElementWithClass, makeHTML, toggleDisabled, toggleDisplayNone,
  setTargetProperty, setEventListener, disposeEventListeners } from './utility';
import { makeMiniEditor, makeToggleBtn, editorDidChange } from './atom-utility';

export default class ReplacingPatternCollectionView {

  constructor(serializedState) {
    let closeButton = createElementWithClass('button', ['replacing-pattern-collection', 'btn', 'icon', 'icon-x']);
    let getButton = createElementWithClass('button', ['replacing-pattern-collection', 'btn', 'icon', 'icon-arrow-up']);
    let readFromButton = createElementWithClass('button', ['replacing-pattern-collection', 'btn']);
    let writeToButton = createElementWithClass('button', ['replacing-pattern-collection', 'btn']);
    readFromButton.textContent = "Read";
    writeToButton.textContent = "Write";

    this.subscriptions = new CompositeDisposable();
    this.filePathEditor = makeMiniEditor(RPC.filePath);
    this.filePathEditor.view = atom.views.getView(this.filePathEditor);
    this.subscriptions.add(
      this.filePathEditor.onDidStopChanging(editorDidChange(this.filePathEditor, RPC, "filePath"))
    );

    this.rootElement = makeHTML(['replacing-pattern-collection'], {tag: 'div'},
      [[], {tag: 'div'},
        closeButton, getButton, readFromButton, writeToButton, this.filePathEditor.view]
    );

    this.eventListeners = [];
    this.eventListeners.push(setEventListener(getButton, "click", RPC.getFindOptions()));
    this.eventListeners.push(setEventListener(closeButton, "click", this.hide));
    this.eventListeners.push(setEventListener(readFromButton, "click", RPC.read()));
    this.eventListeners.push(setEventListener(writeToButton, "click", RPC.write()));

    this.optionElement = null;
    this.viewElements = [];
  }

  makeLiElement(options, isAdd) {
    if(!isAdd) {
      for (let i = 0; i < this.viewElements.length; i++) {
        this.viewElements[i].dispose();
      }
      this.viewElements = [];
    }
    let count = 0;
    for (let option of options) {
      let element = new ViewElement(option, count++);
      this.viewElements.push(element);
    }
    this.countOptions();
    this.appendToRoot();
  }

  appendToRoot() {
    if(this.optionsElement) {
      this.rootElement.removeChild(this.optionsElement);
    }
    this.optionsElement = createElementWithClass('ol', ['replacing-pattern-collection']);
    this.rootElement.appendChild(this.optionsElement);

    for(let i = 0; i < this.viewElements.length; ++i) {
      this.optionsElement.appendChild(this.viewElements[i].element);
    }
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.rootElement.remove();
    this.subscriptions.dispose();
    disposeEventListeners(this.eventListeners);
  }

  getElement() {
    return this.rootElement;
  }

  countOptions() {
    //console.log("recount", this.viewElements.length);
    for(let i = 0; i < this.viewElements.length; ++i) {
      this.viewElements[i].number = i;
      this.viewElements[i].setTabIndex();
    }
  }

  hide() {
    RPC.modalPanel.hide()
  }
}

class ViewElement {
  constructor(option){
    this.option = option ? option : null;
    this.number = 0//number ? number : 0;
    this.subscriptions = new CompositeDisposable();
    this.eventListeners = [];

    ViewElement.setMiniEditors(this, option);
    ViewElement.setEditorDidChange(this);
    ViewElement.makeButtons(this);
    ViewElement.makeElement(this);
    ViewElement.setButtonOnClick(this);
    this.setTabIndex();
  }

  static setEditorDidChange(target){
    target.subscriptions.add(
      target.findEditor.onDidStopChanging(editorDidChange(target.findEditor, target.option, "findPattern"))
    );
    target.subscriptions.add(
      target.replaceEditor.onDidStopChanging(editorDidChange(target.replaceEditor, target.option, "replacePattern"))
    );
    target.subscriptions.add(
      target.pathsEditor.onDidStopChanging(editorDidChange(target.pathsEditor, target.option, "pathsPattern"))
    );
  }

  static setButtonOnClick(target) {
    target.eventListeners.push(setEventListener(target.setButton, "click", ViewElement.set(target)));
    target.eventListeners.push(setEventListener(target.setButton, "keypress", ViewElement.set(target)));
    target.eventListeners.push(setEventListener(target.deleteButton, "click", ViewElement.del(target)));
    target.eventListeners.push(
      makeToggleBtn(target.projectFindButton, target.option.projectFind, ViewElement.projectFindToggle(target))
    );
    target.eventListeners.push(
      makeToggleBtn(target.useRegexButton, target.option.useRegex, setTargetProperty(target.option, "useRegex"))
    );
    target.eventListeners.push(
      makeToggleBtn(target.caseSensitiveButton, target.option.caseSensitive,
        setTargetProperty(target.option, "caseSensitive"))
    );
    target.eventListeners.push(
      makeToggleBtn(target.inCurrentSelectionButton, target.option.inCurrentSelection,
        setTargetProperty(target.option, "inCurrentSelection"))
    );
    target.eventListeners.push(
      makeToggleBtn(target.wholeWordButton, target.option.wholeWord, setTargetProperty(target.option, "wholeWord")));
  }

  static makeElement(target) {
    //console.log(target);
    target.element = makeHTML([`replacing-pattern-collection`], {tag: `li`},
      [[], {tag: `table`},
        [[], {tag: `tr`},
          [[], {tag: `td`, class: `left`},
            [[], {tag: `span`, textContent: `find:`},
              target.findEditorView],
            [[], {tag: `span`, textContent: `replace:`},
              target.replaceEditorView],
            [[], {tag: `span`, textContent: `paths:`},
              target.pathsEditorView]
          ],
          [[], {tag: `td`, class: `right`},
            [[], {tag: `div`, class: `block`},
              [['btn-group', 'btn-group-sm'], {tag: `div`},
                target.setButton, target.deleteButton]
            ],
            [[], {tag: `div`, class: `block`},
              target.projectFindButton
            ],
            [[], {tag: `div`, class: `block`},
              [['btn-group', 'btn-group-sm'], {tag: `div`},
                target.useRegexButton, target.caseSensitiveButton, target.inCurrentSelectionButton,
                target.wholeWordButton
              ]
            ]
          ]
        ]
      ]
    );
    toggleDisplayNone([target.pathsEditorView.parentNode], !target.option.projectFind);
    toggleDisabled([target.inCurrentSelectionButton], target.option.projectFind);
  }

  dispose() {
    //console.log("dispose", this);
    this.subscriptions.dispose();
    this.element.remove();
    disposeEventListeners(this.eventListeners);
  }

  setTabIndex() {
    this.findEditorView.tabIndex = this.number * 4 + 1;
    this.replaceEditorView.tabIndex = this.number * 4 + 2;
    this.pathsEditorView.tabIndex = this.number * 4 + 3;
    this.setButton.tabIndex = this.number * 4 + 4;
  }

  static setMiniEditors(obj, option) {
    obj.findEditor = makeMiniEditor(option.findPattern);
    obj.findEditorView = atom.views.getView(obj.findEditor);
    obj.replaceEditor = makeMiniEditor(option.replacePattern);
    obj.replaceEditorView = atom.views.getView(obj.replaceEditor);
    obj.pathsEditor = makeMiniEditor(option.pathsPattern);
    obj.pathsEditorView = atom.views.getView(obj.pathsEditor);

  }

  static makeButtons(obj) {
    obj.setButton = createElementWithClass('button',
      ['replacing-pattern-collection', 'btn', 'icon', 'icon-arrow-down']);
    obj.deleteButton = createElementWithClass('button',
      ['replacing-pattern-collection', 'btn', 'icon', 'icon-trashcan']);
    //
    obj.projectFindButton = createElementWithClass('button',
      ['replacing-pattern-collection', 'btn', 'btn-sm', 'icon', 'icon-file-submodule']);
    obj.useRegexButton = createElementWithClass('button',
      ['replacing-pattern-collection', 'btn']);
    obj.useRegexButton.innerHTML = '<svg class="replacing-pattern-collection"><use xlink:href="#find-and-replace-icon-regex" /></svg>';
    obj.caseSensitiveButton = createElementWithClass('button', ['replacing-pattern-collection', 'btn']);
    obj.caseSensitiveButton.innerHTML = '<svg class="replacing-pattern-collection"><use xlink:href="#find-and-replace-icon-case" /></svg>';
    obj.inCurrentSelectionButton = createElementWithClass('button', ['replacing-pattern-collection', 'btn']);
    obj.inCurrentSelectionButton.innerHTML = '<svg class="replacing-pattern-collection"><use xlink:href="#find-and-replace-icon-selection" /></svg>';
    obj.wholeWordButton = createElementWithClass('button', ['replacing-pattern-collection', 'btn']);
    obj.wholeWordButton.innerHTML = '<svg class="replacing-pattern-collection"><use xlink:href="#find-and-replace-icon-word" /></svg>';
  }

  static projectFindToggle(obj) {
    return () => {
      obj.option.projectFind = !obj.option.projectFind;
      toggleDisplayNone([obj.pathsEditorView.parentNode], !obj.option.projectFind);
      toggleDisabled([obj.inCurrentSelectionButton], obj.option.projectFind);
    };
  }

  static set(target) {
    return (key) => {
      //console.log("set");
      RPC.modalPanel.hide();
      if(target.option.projectFind) {
        RPC.projectFind(target.option);
      } else {
        RPC.find(target.option);
      }
    };
  }

  static del(target) {
    return () => {
      RPC.findOptions.splice(target.number, 1);
      RPC.view.viewElements[target.number].dispose();
      RPC.view.viewElements.splice(target.number, 1);
      RPC.view.appendToRoot();
      RPC.view.countOptions();
    };
  }
}
