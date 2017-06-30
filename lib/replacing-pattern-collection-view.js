"use babel";

import {
  checkEventClickOrEnter,
  makeButton,
  makeInputNumber,
  makeInputText,
  setToggleState,
} from "./utilities/atom-utility";
import {
  createElementWithClass,
  disposeEventListeners,
  focusElement,
  getTabStopElements,
  makeHTML,
  toggleDisabled,
} from "./utilities/html-utility";
import { CompositeDisposable } from "atom";
import RPC from "./replacing-pattern-collection";
import { RPCFindOptions } from "./cson-file";

export default class ReplacingPatternCollectionView {
  constructor() {
    this.subscriptions = new CompositeDisposable();
    this.eventListeners = [];

    this.currentOption = RPC.findOptions[0];
    this.currentOption.index = 0; //index propertyでなく別の変数にした方が良いかもしれない

    this.makeElements();
    this.makeRootElement();

    this.setTabIndex();
    this.tabStopElements = getTabStopElements(this.rootElement, RPC.name);
  }

  /*
  make element
  //*/

  makeElements() {
    this.filePathInput = makeInputText("search", [RPC.name, "filePath"], "filePath", RPC.filePath,
      ReplacingPatternCollectionView.setInput(RPC, "filePath", "text"), false, this.eventListeners);
    this.currentNumberInput = makeInputNumber([RPC.name, "currentNumber"], "currentNumber", 1, null, 1,
      this.onChangeCurrentNumber(), false, this.eventListeners);

    this.descriptionInput = makeInputText("search", [RPC.name, "description"], "description", "",
      ReplacingPatternCollectionView.setInput(this.currentOption, "description", "text"), false, this.eventListeners);
    this.findInput = makeInputText("search", [RPC.name, "find"], "find", "",
      ReplacingPatternCollectionView.setInput(this.currentOption, "find", "text"), false, this.eventListeners);
    this.replaceInput = makeInputText("search", [RPC.name, "replace"], "replace", "",
      ReplacingPatternCollectionView.setInput(this.currentOption, "replace", "text"), false, this.eventListeners);
    this.pathsInput = makeInputText("search", [RPC.name, "paths"], "paths", "",
      ReplacingPatternCollectionView.setInput(this.currentOption, "paths", "text"), false, this.eventListeners);

    this.closeButton = makeButton([RPC.name, "close"], "", false, "normal", "no-color", "no-inline", "icon-x",
      null, null, ReplacingPatternCollectionView.close, false, this.eventListeners);
    this.readFromButton = makeButton([RPC.name, "readFrom"], "read", false, "normal", "no-color", "no-inline", null,
      null, null, ReplacingPatternCollectionView.read, false, this.eventListeners);
    this.writeToButton = makeButton([RPC.name, "writeTo"], "write", false, "normal", "no-color", "no-inline", null,
      null, null, ReplacingPatternCollectionView.write, false, this.eventListeners);
    this.openButton = makeButton([RPC.name, "open"], "open", false, "normal", "no-color", "no-inline", null,
      null, null, ReplacingPatternCollectionView.open, false, this.eventListeners);

    this.getButton = makeButton([RPC.name, "get"], "get", false, "normal", "no-color", "no-inline", null,
      null, null, ReplacingPatternCollectionView.get, false, this.eventListeners);
    this.setButton = makeButton([RPC.name, "set"], "set", false, "normal", "no-color", "no-inline", null,
      null, null, this.set(), false, this.eventListeners);
    this.deleteButton = makeButton([RPC.name, "delete"], "", false, "normal", "no-color", "no-inline",
      "icon-trashcan", null, null, this.del(), false, this.eventListeners);

    this.projectFindButton = makeButton([RPC.name, "projectFind"], "", false, "normal", "no-color", "no-inline",
      "icon-file-submodule", null, true, this.projectFindToggle(), false, this.eventListeners);
    this.useRegexButton = makeButton([RPC.name, "useRegex"], "", false, "normal", "no-color", "no-inline", null,
      "<svg class=\"replacing-pattern-collection\"><use xlink:href=\"#find-and-replace-icon-regex\"></svg>",
      true, this.onClickToggleButton("useRegex"), false, this.eventListeners);
    this.caseSensitiveButton = makeButton([RPC.name, "caseSensitive"], "", false, "normal", "no-color", "no-inline", null,
      "<svg class=\"replacing-pattern-collection\"><use xlink:href=\"#find-and-replace-icon-case\"></svg>",
      true, this.onClickToggleButton("caseSensitive"), false, this.eventListeners);
    this.inCurrentSelectionButton = makeButton([RPC.name, "inCurrentSelection"], "", false, "normal", "no-color", "no-inline", null,
      "<svg class=\"replacing-pattern-collection\"><use xlink:href=\"#find-and-replace-icon-selection\"></svg>",
      true, this.onClickToggleButton("inCurrentSelection"), false, this.eventListeners);
    this.wholeWordButton = makeButton([RPC.name, "wholeWord"], "", false, "normal", "no-color", "no-inline", null,
      "<svg class=\"replacing-pattern-collection\"><use xlink:href=\"#find-and-replace-icon-word\"></svg>",
      true, this.onClickToggleButton("wholeWord"), false, this.eventListeners);

    this.firstButton = makeButton([RPC.name, "first"], "", false, "normal", "no-color", "no-inline",
      "icon-jump-up", null, null, this.first(), false, this.eventListeners);
    this.previousButton = makeButton([RPC.name, "previous"], "", false, "normal", "no-color", "no-inline",
      "icon-triangle-up", null, null, this.previous(), false, this.eventListeners);
    this.nextButton = makeButton([RPC.name, "next"], "", false, "normal", "no-color", "no-inline",
      "icon-triangle-down", null, null, this.next(), false, this.eventListeners);
    this.lastButton = makeButton([RPC.name, "last"], "", false, "normal", "no-color", "no-inline",
      "icon-jump-down", null, null, this.last(), false, this.eventListeners);

    this.optionsNumberElement = createElementWithClass("span", [RPC.name]);
    this.optionsNumberElement.textContent = "1";
  }

  makeRootElement() {
    this.rootElement = makeHTML([RPC.name], { "tag": "div", "class": ["root", "native-key-bindings"] }, [
        [], { "tag": "div", "class": ["block", "btn-file"] },
        this.readFromButton, this.writeToButton, this.openButton, this.closeButton,
      ],
      this.filePathInput, [
        [], { "tag": "div", "class": "block" },
        [
          [], { "tag": "div", "class": ["btn-group", "btn-group-sm"] },
          this.getButton, this.setButton, this.deleteButton,
        ],
        { "tag": "span", "textContent": "flags: " },
        [
          [], { "tag": "div", "class": ["btn-group", "btn-group-sm"] },
          this.projectFindButton, this.useRegexButton, this.caseSensitiveButton, this.inCurrentSelectionButton,
          this.wholeWordButton,
        ],
      ], [
        [], { "tag": "table" },
        [
          [], { "tag": "tr" },
          [
            [], { "tag": "td", "class": "left" },
            [
              [], { "tag": "table" },
              [
                [], { "tag": "tr" },
                [
                  [], { "tag": "td" },
                  this.firstButton,
                ],
              ],
              [
                [], { "tag": "tr" },
                [
                  [], { "tag": "td" },
                  this.previousButton,
                ],
              ],
              [
                [], { "tag": "tr" },
                [
                  [], { "tag": "td" },
                  this.currentNumberInput,
                ],
              ],
              [
                [], { "tag": "tr" },
                [
                  [], { "tag": "td" },
                  this.optionsNumberElement,
                ],
              ],
              [
                [], { "tag": "tr" },
                [
                  [], { "tag": "td" },
                  this.nextButton,
                ],
              ],
              [
                [], { "tag": "tr" },
                [
                  [], { "tag": "td" },
                  this.lastButton,
                ],
              ],
            ],
          ],
          [
            [], { "tag": "td", "class": "right" },
            [
              [], { "tag": "span", "textContent": "description:", "class": "description" },
              this.descriptionInput,
            ],
            [
              [], { "tag": "span", "textContent": "find:" },
              this.findInput,
            ],
            [
              [], { "tag": "span", "textContent": "replace:" },
              this.replaceInput,
            ],
            [
              [], { "tag": "div", "textContent": "paths:" },
              this.pathsInput,
            ],
          ],
        ],
      ]
    );
  }

  setTabIndex() {
    let i = 0;

    this.readFromButton.tabIndex = ++i;
    this.writeToButton.tabIndex = ++i;
    this.openButton.tabIndex = ++i;
    this.closeButton.tabIndex = ++i;
    this.filePathInput.tabIndex = ++i;

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
    this.currentNumberInput.tabIndex = ++i;
    this.nextButton.tabIndex = ++i;
    this.lastButton.tabIndex = ++i;

    this.descriptionInput.tabIndex = ++i;
    this.findInput.tabIndex = ++i;
    this.replaceInput.tabIndex = ++i;
    this.pathsInput.tabIndex = ++i;
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

  updateFindToggle() {
    //toggleDisplayNone([this.pathsInput.parentNode], !this.currentOption.projectFind);
    toggleDisabled([this.inCurrentSelectionButton], this.currentOption.projectFind);
  }

  updateView() {
    this.currentNumberInput.value = this.currentOption.index + 1;
    this.descriptionInput.value = this.currentOption.description;
    this.findInput.value = this.currentOption.findPattern;
    this.replaceInput.value = this.currentOption.replacePattern;
    this.pathsInput.value = this.currentOption.pathsPattern;

    this.updateFindToggle();
    setToggleState(this.projectFindButton, this.currentOption.projectFind);
    setToggleState(this.useRegexButton, this.currentOption.useRegex);
    setToggleState(this.caseSensitiveButton, this.currentOption.caseSensitive);
    setToggleState(this.wholeWordButton, this.currentOption.wholeWord);
    setToggleState(this.inCurrentSelectionButton, this.currentOption.inCurrentSelection);
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
      if (checkEventClickOrEnter(evt) === false && evt.type !== `${RPC.name}:set`) {
        return;
      }
      if (this.currentOption.projectFind) {
        RPC.projectFind(this.currentOption);
      } else {
        RPC.find(this.currentOption);
      }
      RPC.hidePanel();
    };
  }

  del() {
    return (evt) => {
      if (checkEventClickOrEnter(evt) === false) {
        return;
      }
      RPC.findOptions.splice(this.currentOption.index, 1);
      if (RPC.findOptions.length === 0) {
        RPC.findOptions.push(new RPCFindOptions());
        this.setCurrentOption(RPC.findOptions[0], 0);
      } else {
        let index = this.currentOption.index - 1 < 0 ? 0 : this.currentOption.index - 1;
        this.setCurrentOption(RPC.findOptions[index], index);
      }
      this.setOptionsNumber(RPC.findOptions.length);
    };
  }

  next() {
    return (evt) => {
      if (checkEventClickOrEnter(evt) === false && evt.type !== `${RPC.name}:next`) {
        return;
      }
      let next = this.currentOption.index + 1;
      let index = next > RPC.findOptions.length - 1 ? 0 : next;

      this.setCurrentOption(RPC.findOptions[index], index);
    };
  }

  last() {
    return (evt) => {
      if (checkEventClickOrEnter(evt) === false && evt.type !== `${RPC.name}:last`) {
        return;
      }
      this.setCurrentOption(RPC.findOptions[RPC.findOptions.length - 1], RPC.findOptions.length - 1);
    };
  }

  previous() {
    return (evt) => {
      if (checkEventClickOrEnter(evt) === false && evt.type !== `${RPC.name}:previous`) {
        return;
      }
      let previous = this.currentOption.index - 1;
      let index = previous < 0 ? RPC.findOptions.length - 1 : previous;

      this.setCurrentOption(RPC.findOptions[index], index);
    };
  }

  first() {
    return (evt) => {
      if (checkEventClickOrEnter(evt) === false && evt.type !== `${RPC.name}:first`) {
        return;
      }
      this.setCurrentOption(RPC.findOptions[0], 0);
    };
  }

  static get(evt) {
    if (checkEventClickOrEnter(evt) === false) {
      return;
    }
    RPC.getFindOptions();
  }

  static close(evt) {
    if (checkEventClickOrEnter(evt) === false) {
      return;
    }
    RPC.hidePanel();
  }

  static read(evt) {
    if (checkEventClickOrEnter(evt) === false) {
      return;
    }
    RPC.read();
  }

  static write(evt) {
    if (checkEventClickOrEnter(evt) === false) {
      return;
    }
    RPC.write();
  }

  static open(evt) {
    if (checkEventClickOrEnter(evt) === false) {
      return;
    }
    RPC.open();
  }

  focusNext() {
    focusElement(this.tabStopElements, "next");
  }

  focusPrevious() {
    focusElement(this.tabStopElements, "previous");
  }

  focusSetButton() {
    this.setButton.focus();
  }

  onChangeCurrentNumber() {
    let old = 0;

    return (evt) => {
      let num = parseInt(evt.target.value, 10);
      if (isNaN(num) === false) {
        --num;
        if (num === old) {
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

  onClickToggleButton(property) {
    return (evt) => {
      if (evt.target.classList.contains("selected")) {
        this.currentOption[property] = true;
      } else {
        this.currentOption[property] = false;
      }
    };
  }

  projectFindToggle() {
    return (evt) => {
      if (evt.target.classList.contains("selected")) {
        this.currentOption.projectFind = true;
      } else {
        this.currentOption.projectFind = false;
      }
      this.updateFindToggle();
    };
  }

  static setInput(obj, property, type, selector) {
    return (evt) => {
      if (type === "number") {
        let num = parseInt(evt.target.value, 10);
        if (isNaN(num)) {
          num = 0;
        }
        obj[property] = num;
      } else if (type === "checker") {
        obj[property] = evt.target.checked;
      } else if (type === "selector") {
        if (selector) {
          obj[property] = selector[evt.target.value];
        } else {
          obj[property] = evt.target.value;
        }
      } else {
        obj[property] = evt.target.value;
      }
    };
  }
}
