'use babel';

import RPC from './replacing-pattern-collection';
import { CompositeDisposable } from 'atom';
import { createElementWithClass, makeHTML, toggleDisabled, toggleDisplayNone,
  setTargetProperty, disposeEventListeners, setEventListenerClickAndEnter } from './utility';
import { makeMiniEditorWithView, makeToggleBtn, editorDidChange, checkEventClickOrEnter } from './atom-utility';

export default class ReplacingPatternCollectionView {

  constructor() {
    this.closeButton = createElementWithClass('button', [RPC.name, 'btn', 'icon', 'icon-x']);
    this.getButton = createElementWithClass('button', [RPC.name, 'btn', 'icon', 'icon-arrow-up']);
    this.readFromButton = createElementWithClass('button', [RPC.name, 'btn']);
    this.writeToButton = createElementWithClass('button', [RPC.name, 'btn']);
    this.readFromButton.textContent = "Read";
    this.writeToButton.textContent = "Write";

    this.subscriptions = new CompositeDisposable();

    this.filePathEditor = makeMiniEditorWithView(RPC.filePath, [RPC.name]);
    this.subscriptions.add(
      this.filePathEditor.onDidStopChanging(editorDidChange(this.filePathEditor, RPC, "filePath"))
    );

    this.rootElement = makeHTML([RPC.name], {tag: 'div', class: 'root'},
      [[], {tag: 'div'},
        this.closeButton, this.getButton, this.readFromButton, this.writeToButton, this.filePathEditor.view]
    );
    this.setTabIndex();

    this.eventListeners = [];
    this.eventListeners.push(setEventListenerClickAndEnter(this.getButton, this.get, false));
    this.eventListeners.push(setEventListenerClickAndEnter(this.closeButton, this.close, false));
    this.eventListeners.push(setEventListenerClickAndEnter(this.readFromButton, this.read, false));
    this.eventListeners.push(setEventListenerClickAndEnter(this.writeToButton, this.write, false));

    this.optionsElement = null;
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

  setTabIndex() {
    this.closeButton.tabIndex = 1;
    this.getButton.tabIndex = 2;
    this.readFromButton.tabIndex = 3;
    this.writeToButton.tabIndex = 4;
    this.filePathEditor.view.tabIndex = 5;
  }

  getTabStopElements() {
    let allElements = this.rootElement.getElementsByClassName(RPC.name);

    this.tabStopElements = [];
    for(let i = 0; i < allElements.length; ++i) {
      if(allElements[i].tabIndex >= 0){
        this.tabStopElements.push(allElements[i]);
      }
    }
    this.tabStopElements.sort((a, b) => {
      if(a.tabIndex > b.tabIndex) {
        return 1;
      }
      if(a.tabIndex < b.tabIndex) {
        return -1;
      }
      return 0;
    });
  }

  getSetButtonElements() {
    this.setButtonElements = Array.apply(null, this.rootElement.getElementsByClassName(RPC.name + ' set btn'))
    this.setButtonElements.sort((a, b) => {
      if(a.tabIndex > b.tabIndex) {
        return 1;
      }
      if(a.tabIndex < b.tabIndex) {
        return -1;
      }
      return 0;
    });
  }

  appendToRoot() {
    if(this.optionsElement) {
      this.rootElement.removeChild(this.optionsElement);
    }
    this.optionsElement = createElementWithClass('ol', [RPC.name]);
    this.rootElement.appendChild(this.optionsElement);

    for(let i = 0; i < this.viewElements.length; ++i) {
      this.optionsElement.appendChild(this.viewElements[i].element);
    }
    this.getTabStopElements();
    this.getSetButtonElements();
  }

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

  get(evt) {
    if(checkEventClickOrEnter(evt) === false) {
      return;
    }
    RPC.getFindOptions();
  }

  close(evt) {
    if(checkEventClickOrEnter(evt) === false) {
      return;
    }
    RPC.hidePanel();
  }

  read(evt) {
    if(checkEventClickOrEnter(evt) === false) {
      return;
    }
    RPC.read();
  }

  write(evt) {
    if(checkEventClickOrEnter(evt) === false) {
      return;
    }
    RPC.write();
  }

  focusNext() {
    //console.log('focusNext');
    let current = document.activeElement.tabIndex;

    for(let i = 0; i < this.tabStopElements.length; ++i) {
      if(this.tabStopElements[i].tabIndex > current
        && this.tabStopElements[i].parentElement.style.display !== "none"
        && this.tabStopElements[i].disabled !== true) {
        this.tabStopElements[i].focus();
        return;
      }
    }
    this.tabStopElements[0].focus();
  }

  focusPrevious() {
    //console.log('focusPrevious');
    let current = document.activeElement.tabIndex;

    for(let i = this.tabStopElements.length - 1; i >= 0 ; --i) {
      if(this.tabStopElements[i].tabIndex < current
        && this.tabStopElements[i].parentElement.style.display !== "none"
        && this.tabStopElements[i].disabled !== true) {
        this.tabStopElements[i].focus();
        return;
      }
    }
    this.tabStopElements[this.tabStopElements.length - 1].focus();
  }

  focusNextSetButton() {
    if(this.setButtonElements.length === 0) {
      return;
    }
    let current = document.activeElement.tabIndex;

    for(let i = 0; i < this.setButtonElements.length; ++i) {
      if(this.setButtonElements[i].tabIndex > current) {
        this.setButtonElements[i].focus();
        return;
      }
    }
    this.setButtonElements[0].focus();
  }

  focusPreviousSetButton() {
    if(this.setButtonElements.length === 0) {
      return;
    }
    let current = document.activeElement.tabIndex;

    for(let i = this.setButtonElements.length - 1; i >= 0; --i) {
      if(this.setButtonElements[i].tabIndex < current) {
        this.setButtonElements[i].focus();
        return;
      }
    }
    this.setButtonElements[this.setButtonElements.length - 1].focus();
  }
}

class ViewElement {
  constructor(option){
    this.option = option ? option : null;
    this.number = 0;//number ? number : 0;
    this.subscriptions = new CompositeDisposable();
    this.eventListeners = [];

    ViewElement.setMiniEditors(this, option);
    ViewElement.setEditorDidChange(this);
    ViewElement.makeButtons(this);
    ViewElement.makeElement(this);
    ViewElement.setButtonOnClick(this);
    this.setTabIndex();
  }

  static setMiniEditors(obj, option) {
    obj.discriptionEditor = makeMiniEditorWithView(option.discription, [RPC.name]);
    obj.findEditor = makeMiniEditorWithView(option.findPattern, [RPC.name]);
    obj.replaceEditor = makeMiniEditorWithView(option.replacePattern, [RPC.name]);
    obj.pathsEditor = makeMiniEditorWithView(option.pathsPattern, [RPC.name]);
  }

  static setEditorDidChange(target){
    target.subscriptions.add(
      target.discriptionEditor.onDidStopChanging(editorDidChange(target.discriptionEditor, target.option, "discription"))
    );
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
    target.eventListeners.push(
      setEventListenerClickAndEnter(target.setButton, ViewElement.set(target), false)
    );
    target.eventListeners.push(
      setEventListenerClickAndEnter(target.deleteButton, ViewElement.del(target), false)
    );
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
            [['discription'], {tag: `span`, textContent: `discription:`},
              target.discriptionEditor.view],
            [[], {tag: `span`, textContent: `find:`},
              target.findEditor.view],
            [[], {tag: `span`, textContent: `replace:`},
              target.replaceEditor.view],
            [[], {tag: `span`, textContent: `paths:`},
              target.pathsEditor.view]
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
    toggleDisplayNone([target.pathsEditor.view.parentNode], !target.option.projectFind);
    toggleDisabled([target.inCurrentSelectionButton], target.option.projectFind);
  }

  dispose() {
    //console.log("dispose", this);
    this.subscriptions.dispose();
    this.element.remove();
    disposeEventListeners(this.eventListeners);
  }

  setTabIndex() {
    const kTabStopNumber = 11;
    const kTabStart = 5;

    this.discriptionEditor.view.tabIndex = kTabStart + this.number * kTabStopNumber + 1;
    this.findEditor.view.tabIndex = kTabStart + this.number * kTabStopNumber + 2;
    this.replaceEditor.view.tabIndex = kTabStart + this.number * kTabStopNumber + 3;
    this.pathsEditor.view.tabIndex = kTabStart + this.number * kTabStopNumber + 4;
    this.setButton.tabIndex = kTabStart + this.number * kTabStopNumber + 5;
    this.deleteButton.tabIndex = kTabStart + this.number * kTabStopNumber + 6;
    this.projectFindButton.tabIndex = kTabStart + this.number * kTabStopNumber + 7;
    this.useRegexButton.tabIndex = kTabStart + this.number * kTabStopNumber + 8;
    this.caseSensitiveButton.tabIndex = kTabStart + this.number * kTabStopNumber + 9;
    this.inCurrentSelectionButton.tabIndex = kTabStart + this.number * kTabStopNumber + 10;
    this.wholeWordButton.tabIndex = kTabStart + this.number * kTabStopNumber + 11;
  }

  static makeButtons(obj) {
    obj.setButton = createElementWithClass('button',
      [RPC.name, 'btn', 'icon', 'icon-arrow-down', 'set']);
    obj.deleteButton = createElementWithClass('button',
      [RPC.name, 'btn', 'icon', 'icon-trashcan']);
    //
    obj.projectFindButton = createElementWithClass('button',
      [RPC.name, 'btn', 'btn-sm', 'icon', 'icon-file-submodule']);
    obj.useRegexButton = createElementWithClass('button',
      [RPC.name, 'btn']);
    obj.useRegexButton.innerHTML = '<svg class="replacing-pattern-collection"><use xlink:href="#find-and-replace-icon-regex" /></svg>';
    obj.caseSensitiveButton = createElementWithClass('button', [RPC.name, 'btn']);
    obj.caseSensitiveButton.innerHTML = '<svg class="replacing-pattern-collection"><use xlink:href="#find-and-replace-icon-case" /></svg>';
    obj.inCurrentSelectionButton = createElementWithClass('button', [RPC.name, 'btn']);
    obj.inCurrentSelectionButton.innerHTML = '<svg class="replacing-pattern-collection"><use xlink:href="#find-and-replace-icon-selection" /></svg>';
    obj.wholeWordButton = createElementWithClass('button', [RPC.name, 'btn']);
    obj.wholeWordButton.innerHTML = '<svg class="replacing-pattern-collection"><use xlink:href="#find-and-replace-icon-word" /></svg>';
  }

  static projectFindToggle(obj) {
    return (state) => {
      obj.option.projectFind = !obj.option.projectFind;
      toggleDisplayNone([obj.pathsEditor.view.parentNode], !obj.option.projectFind);
      toggleDisabled([obj.inCurrentSelectionButton], obj.option.projectFind);
    };
  }

  static set(target) {
    return (evt) => {
      if(checkEventClickOrEnter(evt) === false){
        return;
      }

      RPC.hidePanel();
      if(target.option.projectFind) {
        RPC.projectFind(target.option);
      } else {
        RPC.find(target.option);
      }
    };
  }

  static del(target) {
    return (evt) => {
      if(checkEventClickOrEnter(evt) === false){
        return;
      }

      RPC.findOptions.splice(target.number, 1);
      RPC.view.viewElements[target.number].dispose();
      RPC.view.viewElements.splice(target.number, 1);
      RPC.view.appendToRoot();
      RPC.view.countOptions();
      RPC.view.rootElement.focus();
    };
  }
}
