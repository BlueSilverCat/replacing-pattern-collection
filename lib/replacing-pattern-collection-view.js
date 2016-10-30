'use babel';

import RPC from './replacing-pattern-collection';
import { CompositeDisposable } from 'atom';
import { RPCFindOptions } from './cson-file';
import { createElementWithClass, makeHTML, toggleDisabled, toggleDisplayNone,
  disposeEventListeners, setEventListenerClickAndEnter } from './utility';
import { makeMiniEditorWithView, makeToggleBtn, editorDidChange, checkEventClickOrEnter,
  toggleBtn } from './atom-utility';

export default class ReplacingPatternCollectionView {

  constructor() {
    this.subscriptions = new CompositeDisposable();
    this.eventListeners = [];

    this.currentOption = RPC.findOptions[0];
    this.currentOption.index = 0; //index propertyでなく別の変数にした方が良いかもしれない

    this.makeMiniEditors();
    this.setEditorDidChange();

    this.makeButtons();
    this.optionsNumberElement = createElementWithClass('span', [RPC.name]);
    this.optionsNumberElement.textContent = '1';
    this.makeRootElement();
    this.setTabIndex();

    this.setEventListeners();

    this.getTabStopElements();
  }

  /*
  make element
  */
  
  makeMiniEditors() {
    this.filePathEditor = makeMiniEditorWithView(RPC.filePath, [RPC.name]);
    this.currentNumberEditor = makeMiniEditorWithView('', [RPC.name]);
    this.descriptionEditor = makeMiniEditorWithView('', [RPC.name]);
    this.findEditor = makeMiniEditorWithView('', [RPC.name]);
    this.replaceEditor = makeMiniEditorWithView('', [RPC.name]);
    this.pathsEditor = makeMiniEditorWithView('', [RPC.name]);
  }

  makeButtons() {
    this.closeButton = createElementWithClass('button', [RPC.name, 'btn', 'icon', 'icon-x']);
    this.getButton = createElementWithClass('button', [RPC.name, 'btn', 'icon', 'icon-arrow-up']);
    this.readFromButton = createElementWithClass('button', [RPC.name, 'btn']);
    this.writeToButton = createElementWithClass('button', [RPC.name, 'btn']);
    this.openButton = createElementWithClass('button', [RPC.name, 'btn']);
    this.readFromButton.textContent = "Read";
    this.writeToButton.textContent = "Write";
    this.openButton.textContent = "Open";

    this.setButton = createElementWithClass('button',
      [RPC.name, 'btn', 'icon', 'icon-arrow-down']);
    this.deleteButton = createElementWithClass('button',
      [RPC.name, 'btn', 'icon', 'icon-trashcan']);
    //
    this.projectFindButton = createElementWithClass('button',
      [RPC.name, 'btn', 'btn-sm', 'icon', 'icon-file-submodule']);
    this.useRegexButton = createElementWithClass('button', [RPC.name, 'btn']);
    this.useRegexButton.innerHTML =
      '<svg class="replacing-pattern-collection"><use xlink:href="#find-and-replace-icon-regex" /></svg>';
    this.caseSensitiveButton = createElementWithClass('button', [RPC.name, 'btn']);
    this.caseSensitiveButton.innerHTML =
      '<svg class="replacing-pattern-collection"><use xlink:href="#find-and-replace-icon-case" /></svg>';
    this.inCurrentSelectionButton = createElementWithClass('button', [RPC.name, 'btn']);
    this.inCurrentSelectionButton.innerHTML =
      '<svg class="replacing-pattern-collection"><use xlink:href="#find-and-replace-icon-selection" /></svg>';
    this.wholeWordButton = createElementWithClass('button', [RPC.name, 'btn']);
    this.wholeWordButton.innerHTML =
      '<svg class="replacing-pattern-collection"><use xlink:href="#find-and-replace-icon-word" /></svg>';

    this.firstButton = createElementWithClass('button', [RPC.name, 'btn', 'btn-sm', 'icon', 'icon-jump-up']);
    this.previousButton = createElementWithClass('button', [RPC.name, 'btn', 'btn-sm', 'icon', 'icon-triangle-up']);
    this.nextButton = createElementWithClass('button', [RPC.name, 'btn', 'btn-sm', 'icon', 'icon-triangle-down']);
    this.lastButton = createElementWithClass('button', [RPC.name, 'btn', 'btn-sm', 'icon', 'icon-jump-down']);
  }

  makeRootElement() {
    this.rootElement = makeHTML([RPC.name], {tag: 'div', class: 'root'},
      [[], {tag: 'div', class: 'block'},
        this.closeButton, this.readFromButton, this.writeToButton, this.openButton
      ],
      this.filePathEditor.view,
      [[], {tag: 'div', class: 'block'},
        [[], {tag: 'div', class: ['btn-group', 'btn-group-sm']},
          this.getButton, this.setButton, this.deleteButton
        ],
        {tag: 'span', textContent: ' flags: '},
        [[], {tag: 'div', class: ['btn-group', 'btn-group-sm']},
          this.projectFindButton, this.useRegexButton, this.caseSensitiveButton, this.inCurrentSelectionButton, this.wholeWordButton
        ]
      ],
      [[], {tag: 'table'},
        [[], {tag: 'tr'},
          [[], {tag: 'td', class: 'left'},
            [[], {tag: 'table'},
              [[], {tag: 'tr'},
                [[], {tag: 'td'}, this.firstButton]
              ],
              [[], {tag: 'tr'},
                [[], {tag: 'td'}, this.previousButton]
              ],
              [[], {tag: 'tr'},
                [[], {tag: 'td'}, this.currentNumberEditor.view]
              ],
              [[], {tag: 'tr'},
                [[], {tag: 'td'}, this.optionsNumberElement]
              ],
              [[], {tag: 'tr'},
                [[], {tag: 'td'}, this.nextButton]
              ],
              [[], {tag: 'tr'},
                [[], {tag: 'td'}, this.lastButton]
              ]
            ]
          ],
          [[], {tag: 'td', class: 'right'},
            [[], {tag: 'span', textContent: 'description:', class: 'description'},
              this.descriptionEditor.view],
            [[], {tag: 'span', textContent: 'find:'},
              this.findEditor.view],
            [[], {tag: 'span', textContent: 'replace:'},
              this.replaceEditor.view],
            [[], {tag: 'div', textContent: 'paths:'},
              this.pathsEditor.view]
          ]
        ]
      ]
    );
  }

  setTabIndex() {
    let i = 0;

    this.closeButton.tabIndex = ++i;
    this.readFromButton.tabIndex = ++i;
    this.writeToButton.tabIndex = ++i;
    this.openButton.tabIndex = ++i;
    this.filePathEditor.view.tabIndex = ++i;

    this.getButton.tabIndex = ++i;
    this.setButton.tabIndex = ++i;
    this.deleteButton.tabIndex = ++i;
    this.projectFindButton.tabIndex = ++i;
    this.useRegexButton.tabIndex = ++i;
    this.caseSensitiveButton.tabIndex = ++i;
    this.inCurrentSelectionButton.tabIndex = ++i;
    this.wholeWordButton.tabIndex = ++i;

    this.firstButton.tabIndex = ++i;
    this.previousButton.tabIndex = ++i;
    this.currentNumberEditor.view.tabIndex = ++i;
    this.nextButton.tabIndex = ++i;
    this.lastButton.tabIndex = ++i;

    this.descriptionEditor.view.tabIndex = ++i;
    this.findEditor.view.tabIndex = ++i;
    this.replaceEditor.view.tabIndex = ++i;
    this.pathsEditor.view.tabIndex = ++i;
  }

  setEditorDidChange() {
    this.subscriptions.add(
      this.filePathEditor.onDidStopChanging(editorDidChange(this.filePathEditor, RPC, "filePath"))
    );
    this.subscriptions.add(
      this.currentNumberEditor.onDidStopChanging(this.onChangeCurrentNumber(this.currentNumberEditor))
    );
    this.subscriptions.add(
      this.descriptionEditor.onDidStopChanging(this.onChangeCurrentOption(this.descriptionEditor, "description"))
    );
    this.subscriptions.add(
      this.findEditor.onDidStopChanging(this.onChangeCurrentOption(this.findEditor, "findPattern"))
    );
    this.subscriptions.add(
      this.replaceEditor.onDidStopChanging(this.onChangeCurrentOption(this.replaceEditor, "replacePattern"))
    );
    this.subscriptions.add(
      this.pathsEditor.onDidStopChanging(this.onChangeCurrentOption(this.pathsEditor, "pathsPattern"))
    );
  }

  setEventListeners() {
    this.eventListeners.push(setEventListenerClickAndEnter(this.setButton, this.set(), false));
    this.eventListeners.push(setEventListenerClickAndEnter(this.deleteButton, this.del(), false));
    this.eventListeners.push(setEventListenerClickAndEnter(this.firstButton, this.first(), false));
    this.eventListeners.push(setEventListenerClickAndEnter(this.previousButton, this.previous(), false));
    this.eventListeners.push(setEventListenerClickAndEnter(this.nextButton, this.next(), false));
    this.eventListeners.push(setEventListenerClickAndEnter(this.lastButton, this.last(), false));
    this.eventListeners.push(setEventListenerClickAndEnter(this.getButton, this.get, false));
    this.eventListeners.push(setEventListenerClickAndEnter(this.closeButton, this.close, false));
    this.eventListeners.push(setEventListenerClickAndEnter(this.readFromButton, this.read, false));
    this.eventListeners.push(setEventListenerClickAndEnter(this.writeToButton, this.write, false));
    this.eventListeners.push(setEventListenerClickAndEnter(this.openButton, this.open, false));
    this.eventListeners.push(
      makeToggleBtn(this.projectFindButton, this.projectFindToggle())
    );
    this.eventListeners.push(
      makeToggleBtn(this.useRegexButton, this.onClickButton("useRegex"))
    );
    this.eventListeners.push(
      makeToggleBtn(this.caseSensitiveButton, this.onClickButton("caseSensitive"))
    );
    this.eventListeners.push(
      makeToggleBtn(this.inCurrentSelectionButton, this.onClickButton("inCurrentSelection"))
    );
    this.eventListeners.push(
      makeToggleBtn(this.wholeWordButton, this.onClickButton("wholeWord"))
    );
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

  //
  setOptionsNumber(num) {
    this.optionsNumberElement.textContent = num;
  }

  setCurrentOption(option, index) {
    this.currentOption = option;
    this.currentOption.index = index;
    this.updateView();
  }

  projectFindToggle() {
    return (state) => {
      this.currentOption.projectFind = state;
      this.updateFindToggle()
    };
  }

  updateFindToggle() {
    //toggleDisplayNone([this.pathsEditor.view.parentNode], !this.currentOption.projectFind);
    toggleDisabled([this.inCurrentSelectionButton], this.currentOption.projectFind);
  }

  updateView() {
    this.currentNumberEditor.setText((this.currentOption.index + 1 ).toString(10));
    this.descriptionEditor.setText(this.currentOption.description);
    this.findEditor.setText(this.currentOption.findPattern);
    this.replaceEditor.setText(this.currentOption.replacePattern);
    this.pathsEditor.setText(this.currentOption.pathsPattern);

    this.updateFindToggle();
    toggleBtn(this.projectFindButton, this.currentOption.projectFind);
    toggleBtn(this.useRegexButton, this.currentOption.useRegex);
    toggleBtn(this.caseSensitiveButton, this.currentOption.caseSensitive);
    toggleBtn(this.wholeWordButton, this.currentOption.wholeWord);
    toggleBtn(this.inCurrentSelectionButton, this.currentOption.inCurrentSelection);
  }

  destroy() {
    this.rootElement.remove();
    this.subscriptions.dispose();
    disposeEventListeners(this.eventListeners);
  }

  getElement() {
    return this.rootElement;
  }

  set() {
    return (evt) => {
      if(checkEventClickOrEnter(evt) === false && evt.type !== RPC.name + ":set") {
        return;
      }
      if(this.currentOption.projectFind) {
        RPC.projectFind(this.currentOption);
      } else {
        RPC.find(this.currentOption);
      }
      RPC.hidePanel();
    }
  }

  del() {
    return (evt) => {
      if(checkEventClickOrEnter(evt) === false){
        return;
      }
      RPC.findOptions.splice(this.currentOption.index, 1);
      if(RPC.findOptions.length !== 0) {
        let index = this.currentOption.index - 1 < 0 ? 0 : this.currentOption.index - 1;

        this.setCurrentOption(RPC.findOptions[index], index);
      } else {
        RPC.findOptions.push(new RPCFindOptions());
        this.setCurrentOption(RPC.findOptions[0], 0);
      }
      this.setOptionsNumber(RPC.findOptions.length);
    };
  }

  next() {
    return (evt) => {
      if(checkEventClickOrEnter(evt) === false && evt.type !== RPC.name + ":next") {
        return;
      }
      let next = this.currentOption.index + 1;
      let index = next > RPC.findOptions.length - 1 ? 0 : next;

      this.setCurrentOption(RPC.findOptions[index], index);
    };
  }

  last() {
    return (evt) => {
      if(checkEventClickOrEnter(evt) === false && evt.type !== RPC.name + ":last") {
        return;
      }
      this.setCurrentOption(RPC.findOptions[RPC.findOptions.length - 1], RPC.findOptions.length - 1);
    };
  }

  previous() {
    return (evt) => {
      if(checkEventClickOrEnter(evt) === false && evt.type !== RPC.name + ":previous"){
        return;
      }
      let previous = this.currentOption.index - 1;
      let index = previous < 0 ? RPC.findOptions.length - 1 : previous;

      this.setCurrentOption(RPC.findOptions[index], index);
    };
  }

  first() {
    return (evt) => {
      if(checkEventClickOrEnter(evt) === false && evt.type !== RPC.name + ":first") {
        return;
      }
      this.setCurrentOption(RPC.findOptions[0], 0);
    };
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

  open(evt) {
    if(checkEventClickOrEnter(evt) === false) {
      return;
    }
    RPC.open();
  }

  focusNext() {
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
    let current = document.activeElement.tabIndex;

    for(let i = this.tabStopElements.length - 1; i >= 0 ; --i) {
      if(this.tabStopElements[i].tabIndex < current
        && this.tabStopElements[i].parentElement.style.display !== "none"
        && this.tabStopElements[i].disabled !== true) {
        this.tabStopElements[i].focus();
        return;
      }
    }
    this.tabStopElements[this.tabStopElements.length - 1].focus();//最後かnoneなので修正が必要
  }

  focusSetButton() {
    this.setButton.focus();
  }

  onChangeCurrentNumber(editor) {
    var old = 0;

    return (evt) => {
      let num = parseInt(editor.getText(), 10);
      if( isNaN(num) === false) {
        --num;
        if(num === old){
          return;
        }
        num = num < 0 ? 0 : num;
        num = num > RPC.findOptions.length - 1 ? RPC.findOptions.length - 1 : num;
        old = num;
        this.setCurrentOption(RPC.findOptions[num], num);
      } else {
        this.setCurrentOption(RPC.findOptions[0], 0);
      }
    };
  }

  onChangeCurrentOption(editor, property) {
    return (evt) => {
      this.currentOption[property] = editor.getText();
    };
  }

  onClickButton(property) {
    return (val) => {
      this.currentOption[property] = val;
    };
  }
}
