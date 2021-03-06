"use babel";

import { CompositeDisposable } from "atom";
import RPC from "./replacing-pattern-collection";
import {
  checkEventClickOrEnter,
  createElementWithClass,
  disposeEventListeners,
  focusElement,
  makeButton,
  makeHTML,
  makeInputNumber,
  makeInputText,
  setTabIndex,
  setToggleState,
  toggleDisabled,
} from "bsc-utilities";

export default class ReplacingPatternCollectionView {
  constructor() {
    this.subscriptions = new CompositeDisposable();
    this.eventListeners = [];

    this.currentIndex = 0;

    this.makeElements();
    this.makeRootElement();

    setTabIndex(this.tabStopElements);
  }

  /*
  make element
  //*/

  makeElements() {
    this.filePathInput = makeInputText("search", [RPC.kName, "filePath"], "filePath", RPC.filePath,
      ReplacingPatternCollectionView.setPath(RPC, "filePath"), false, this.eventListeners);
    this.currentNumberInput = makeInputNumber([RPC.kName, "currentNumber"], "currentNumber", 1, null, 1,
      this.onChangeCurrentNumber(), false, this.eventListeners);

    this.descriptionInput = makeInputText("search", [RPC.kName, "description"], "description", "",
      this.setInput("description"), false, this.eventListeners);
    this.findInput = makeInputText("search", [RPC.kName, "find"], "find", "",
      this.setInput("findPattern"), false, this.eventListeners);
    this.replaceInput = makeInputText("search", [RPC.kName, "replace"], "replace", "",
      this.setInput("replacePattern"), false, this.eventListeners);
    this.pathsInput = makeInputText("search", [RPC.kName, "paths"], "paths", "",
      this.setInput("pathsPattern"), false, this.eventListeners);

    this.closeButton = makeButton([RPC.kName, "close"], "", false, "normal", "no-color", "no-inline", "icon-x",
      null, null, ReplacingPatternCollectionView.close, false, this.eventListeners);
    this.readFromButton = makeButton([RPC.kName, "readFrom"], "read", false, "normal", "no-color", "no-inline", null,
      null, null, ReplacingPatternCollectionView.read, false, this.eventListeners);
    this.writeToButton = makeButton([RPC.kName, "writeTo"], "write", false, "normal", "no-color", "no-inline", null,
      null, null, ReplacingPatternCollectionView.write, false, this.eventListeners);
    this.openButton = makeButton([RPC.kName, "open"], "open", false, "normal", "no-color", "no-inline", null,
      null, null, ReplacingPatternCollectionView.open, false, this.eventListeners);

    this.getButton = makeButton([RPC.kName, "get"], "get", false, "normal", "no-color", "no-inline", null,
      null, null, ReplacingPatternCollectionView.get, false, this.eventListeners);
    this.setButton = makeButton([RPC.kName, "set"], "set", false, "normal", "no-color", "no-inline", null,
      null, null, this.set(), false, this.eventListeners);
    this.deleteButton = makeButton([RPC.kName, "delete"], "", false, "normal", "no-color", "no-inline",
      "icon-trashcan", null, null, this.del(), false, this.eventListeners);

    this.projectFindButton = makeButton([RPC.kName, "projectFind"], "", false, "normal", "no-color", "no-inline",
      "icon-file-submodule", null, false, this.projectFindToggle(), false, this.eventListeners);
    this.useRegexButton = makeButton([RPC.kName, "useRegex"], "", false, "normal", "no-color", "no-inline", null,
      "<svg class=\"replacing-pattern-collection\"><use xlink:href=\"#find-and-replace-icon-regex\"></svg>",
      false, this.onClickToggleButton("useRegex"), false, this.eventListeners);
    this.caseSensitiveButton = makeButton([RPC.kName, "caseSensitive"], "", false, "normal", "no-color", "no-inline", null,
      "<svg class=\"replacing-pattern-collection\"><use xlink:href=\"#find-and-replace-icon-case\"></svg>",
      false, this.onClickToggleButton("caseSensitive"), false, this.eventListeners);
    this.inCurrentSelectionButton = makeButton([RPC.kName, "inCurrentSelection"], "", false, "normal", "no-color", "no-inline", null,
      "<svg class=\"replacing-pattern-collection\"><use xlink:href=\"#find-and-replace-icon-selection\"></svg>",
      false, this.onClickToggleButton("inCurrentSelection"), false, this.eventListeners);
    this.wholeWordButton = makeButton([RPC.kName, "wholeWord"], "", false, "normal", "no-color", "no-inline", null,
      "<svg class=\"replacing-pattern-collection\"><use xlink:href=\"#find-and-replace-icon-word\"></svg>",
      false, this.onClickToggleButton("wholeWord"), false, this.eventListeners);

    this.firstButton = makeButton([RPC.kName, "first"], "", false, "normal", "no-color", "no-inline",
      "icon-jump-up", null, null, this.move("first"), false, this.eventListeners);
    this.previousButton = makeButton([RPC.kName, "previous"], "", false, "normal", "no-color", "no-inline",
      "icon-triangle-up", null, null, this.move("previous"), false, this.eventListeners);
    this.nextButton = makeButton([RPC.kName, "next"], "", false, "normal", "no-color", "no-inline",
      "icon-triangle-down", null, null, this.move("next"), false, this.eventListeners);
    this.lastButton = makeButton([RPC.kName, "last"], "", false, "normal", "no-color", "no-inline",
      "icon-jump-down", null, null, this.move("last"), false, this.eventListeners);

    this.optionsNumberElement = createElementWithClass("span", [RPC.kName]);
    this.optionsNumberElement.textContent = "1";

    this.tabStopElements = [
      this.readFromButton,
      this.writeToButton,
      this.openButton,
      this.closeButton,
      this.filePathInput,

      this.getButton,
      this.setButton,
      this.deleteButton,
      this.projectFindButton,
      this.useRegexButton,
      this.caseSensitiveButton,
      this.inCurrentSelectionButton,
      this.wholeWordButton,

      this.firstButton,
      this.previousButton,
      this.currentNumberInput,
      this.nextButton,
      this.lastButton,

      this.descriptionInput,
      this.findInput,
      this.replaceInput,
      this.pathsInput,
    ];
  }

  makeRootElement() {
    this.rootElement = makeHTML([RPC.kName], { "tag": "div", "class": ["root", "native-key-bindings"] }, [
        [], { "tag": "div", "class": ["block", "btn-file"] },
        this.readFromButton, this.writeToButton, this.openButton, this.closeButton,
      ],
      this.filePathInput, [
        [], { "tag": "div", "class": "block" },
        [
          [], { "tag": "div", "class": ["btn-group", "btn-group-sm"] },
          this.getButton, this.setButton, this.deleteButton,
        ],
        { "tag": "span", "class": "flags", "textContent": "flags: " },
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

  updateFindToggle() {
    toggleDisabled([this.pathsInput], !RPC.findOptions[this.currentIndex].projectFind);
    toggleDisabled([this.inCurrentSelectionButton], RPC.findOptions[this.currentIndex].projectFind);
  }

  updateView(index) {
    this.currentIndex = index;
    this.currentNumberInput.value = index + 1;
    if (RPC.findOptions.length < 1) {
      return;
    }
    this.optionsNumberElement.textContent = RPC.findOptions.length;
    this.descriptionInput.value = RPC.findOptions[index].description;
    this.findInput.value = RPC.findOptions[index].findPattern;
    this.replaceInput.value = RPC.findOptions[index].replacePattern;
    this.pathsInput.value = RPC.findOptions[index].pathsPattern;

    this.updateFindToggle();
    setToggleState(this.projectFindButton, RPC.findOptions[index].projectFind);
    setToggleState(this.useRegexButton, RPC.findOptions[index].useRegex);
    setToggleState(this.caseSensitiveButton, RPC.findOptions[index].caseSensitive);
    setToggleState(this.wholeWordButton, RPC.findOptions[index].wholeWord);
    setToggleState(this.inCurrentSelectionButton, RPC.findOptions[index].inCurrentSelection);
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
      if (checkEventClickOrEnter(evt) === false && evt.type !== `${RPC.kName}:set`) {
        return;
      }
      if (RPC.findOptions[this.currentIndex].projectFind) {
        RPC.projectFind(RPC.findOptions[this.currentIndex]);
      } else {
        RPC.find(RPC.findOptions[this.currentIndex]);
      }
      RPC.hidePanel();
    };
  }

  del() {
    return (evt) => {
      if (checkEventClickOrEnter(evt) === false) {
        return;
      }
      if (RPC.findOptions.length > 1) {
        RPC.findOptions.splice(this.currentIndex, 1);
      }
      let index = this.currentIndex > RPC.findOptions.length - 1 ? RPC.findOptions.length - 1 : this.currentIndex;
      this.updateView(index);
    };
  }

  move(position) {
    return (_evt) => {
      let index = this.currentIndex;
      switch (position) {
        case "first":
          index = 0;
          break;
        case "previous":
          if (--index < 0) {
            index = RPC.findOptions.length - 1;
          }
          break;
        case "next":
          if (++index > RPC.findOptions.length - 1) {
            index = 0;
          }
          break;
        case "last":
          index = RPC.findOptions.length - 1;
          break;
        default:
          index = 0;
      }
      this.updateView(index);
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
      let index = parseInt(evt.target.value, 10);

      if (isNaN(index) === false) {
        --index;
        if (index === old) {
          return;
        }

        index = index > RPC.findOptions.length - 1 ? RPC.findOptions.length - 1 : index;
        index = index < 0 ? 0 : index;
        old = index;
      }
      this.updateView(index);
    };
  }

  //svgをクリックするとevt.targetがsvgになってしまうのでevt.targetで判定は出来ない
  onClickToggleButton(property) {
    return (evt) => {
      let target = evt.target;
      while (target !== null && target.nodeName.toLowerCase() !== "button") {
        target = target.parentElement;
      }
      if (target === null) {
        return;
      }

      if (target.classList.contains("selected")) {
        RPC.findOptions[this.currentIndex][property] = true;
      } else {
        RPC.findOptions[this.currentIndex][property] = false;
      }
    };
  }

  projectFindToggle() {
    return (evt) => {
      if (evt.target.classList.contains("selected")) {
        RPC.findOptions[this.currentIndex].projectFind = true;
      } else {
        RPC.findOptions[this.currentIndex].projectFind = false;
      }
      this.updateFindToggle();
    };
  }

  static setPath(obj, property) {
    return (evt) => {
      obj[property] = evt.target.value;
      atom.config.set(`${RPC.kName}.defaultFilePath`, evt.target.value);
    };
  }

  setInput(property) {
    return (evt) => {
      RPC.findOptions[this.currentIndex][property] = evt.target.value;
    };
  }
}
