'use babel';

import fs from 'fs';

//what: 関数を実行するthis; first, second : Array; func :Function;
export function doOnlySecond(what, first, second, func) {
  const kErr = -1;

  for (let v of second) {
    if(first.indexOf(v) === kErr) {
      func.call(what, v);
    }
  }
  return first;
}

//first, second : Array;
export function getOnlySecond(first, second) {
  const kErr = -1;
  let result = [];

  for (let v of second) {
    if(first.indexOf(v) === kErr) {
      result.push(v)
    }
  }
  return result;
}

export function binarySearch(array, target, compare) {
  let left = 0;
  let right = array.length -1;
  let middle = 0;
  let cmp = 0;

  while(left <= right) {
    middle = (left + right) >> 1;
    cmp = compare(target, array[middle]);
    if(cmp === 0) {
      return middle;
    }
    if(cmp < 0) {
      right = middle - 1;
    } else {
      left = middle + 1;
    }
  }
  return -1;
}
/*
switch (typeof i) {
  case 'object':
  case 'undefined':
  case 'number':
  case 'string':
  case 'boolean':
  case 'function':
  default:
*/
/*
let oa = {x: 1, y: 2}
let ob = deepCopyX(oa);
let oc = oa;
let a = [1, 2, oa, 4];
let b = deepCopyX(a);
let c = a;
console.log(oa, ob, oc, a, b, c);
a[0] = 111;
a[2].x = 111;
console.log(oa, ob, oc, a, b, c);
*///

//need more test
export function deepCopy(data) {
  if(typeof data !== 'object') {
    return data;
  }

  let result = null;

  if( Object.prototype.toString.call(data) === '[object Array]') {
    result = [];
  } else {
    result = {};
  }

  for(let i of Object.keys(data)) {
    if(typeof data[i] === 'object') {
      result[i] = deepCopy(data[i]);
    } else {
      result[i] = data[i];
    }
  }
  return result;
}

export function checkInteger(num, minimum, maximam){
  if( Number.isInteger(num) === false || minimum&&(num < minimum) || maximam&&(num > maximam)) {
    return false;
  }
  return true;
}

export function stringToBoolean(bool){
  return bool === "true" ? true : false;
}

function unicodeEscapeSequenceReplacer(match, p1, offset, string){
  return String.fromCodePoint(parseInt(p1, 16));
}

export function unicodeEscapeSequenceToChar(string) {
  const kUnicode = /\\u{?([A-Fa-f0-9]+)}?/g;

  return string.replace(kUnicode, unicodeEscapeSequenceReplacer);
}

export function stringToRegex(string) {
  const kCheckRegex1 = /\/(.*)\/(.*)/;   //use this forconvert string to Regex
  const kCheckRegex2 = /^[gimy]{0,4}$/;  //for check regular expression. whether flags are valid or not
  const kCheckRegex3 = /(.).*?\1/;       //for check regular expression. whether flags are duplicate or not
  let match = kCheckRegex1.exec(string);

  if ( match !== null
    && match[1] !== ''
    && kCheckRegex2.test(match[2])  //flag checking
    && !kCheckRegex3.test(match[2]) //duplicate
  ) {
    return new RegExp(match[1], match[2]);
  }
  return null;
}

//targetStrの中にあるsearchStrをreplaceStrに置き換える
//前にnPrevと、後ろにnNextがない場合に限る
//nPrevとnNextが空文字列の場合は、判定に使われない
export function replace(targetStr, searchStr, replaceStr, nPrev, nNext) {
  let result = targetStr
  for(let i = 0; i < result.length; ++i) {
    if(result.substr(i, searchStr.length) === searchStr
      && checkSubStr(result, i - nPrev.length, nPrev) === false
      && checkSubStr(result, i + searchStr.length, nNext) === false) {
      result = result.slice(0, i) + replaceStr + result.slice(i + searchStr.length);
    }
  }
  return result;
}

//targetStrの部分文字列とsearchStrを比較する
//searchStrが空文字列の場合は比較しないでfalseを返す
function checkSubStr(targetStr, pos, searchStr) {
  if(searchStr === '' || pos < 0 || pos + searchStr.length > targetStr.length ) {
    return false;
  }
  return targetStr.substr(pos, searchStr.length) === searchStr;
}

//負の数の場合か、長さが足りない場合には空文字列を返す
export function getSubStr(str, pos, len) {
  if(pos < 0 || pos + len > str.length) {
    return '';
  }
  return str.substr(pos, len);
}

export function appendSpan(target, str, data, addbr) {
  let span = document.createElement('span');

  span.textContent = str + data.toString();
  target.appendChild(span);
  if(addbr){
    target.appendChild(document.createElement('br'));
  }
}

export function replaceEle(target, oldEle, newEle) {
  if(oldEle === null) {
    target.appendChild(newEle);
  } else {
    target.replaceChild(newEle, oldEle);
  }
}

export function countSpan(ele, count){
  let elelist = ele.children, tmp = null;

  if(count === null){
    tmp = {maxLength: 0, number: 0};
  } else {
    tmp = count;
  }

  for(let i = 0; i < elelist.length; ++i) {
    if(elelist[i].tagName === "SPAN") {
      tmp.number += 1;
      tmp.maxLength = tmp.maxLength > elelist[i].textContent.length ? tmp.maxLength : elelist[i].textContent.length;
    }
    tmp = countSpan(elelist[i], tmp);
  }
  return tmp;
}

export function getElement(tagName, ele, out){
  let children = ele.children, tmp = [];

  if(out) {
    tmp = out;
  }

  for(let i = 0; i < children.length; ++i) {
    if(children[i].tagName === tagName) {
      tmp.push(children[i]);
    }
    tmp = getElement(tagName, children[i], tmp);
  }
  return tmp;
}

export function createElementWithClass(tag, cla){
  let ele = document.createElement(tag);

  for (let i = 0; i < cla.length; ++i) {
    ele.classList.add(cla[i]);
  }
  return ele;
}

export function createElementWithIDClass(tag, id, cla){
  let ele = createElementWithClass(tag, cla);

  if(isEmptyString(id) === false) {
    ele.id = id
  }
  return ele;
}

//{tab:'div', id: 'id', class:[`btn`, `btn-sm`], textContent'text', innerHTML: 'innerHTML', tabIndex: n,
// children: [HTMLElements] }
function makeElementFromObj(obj, addClass) {
  let tag = null, cla = [];
  let element = null;

  if(typeof addClass !== 'undefined') {
    cla = addClass;
  }

  if(obj.hasOwnProperty('tag')){
    tag = obj.tag;
  } else {
    return null;
  }
  if(obj.hasOwnProperty('class')){
    cla = cla.concat(obj.class);
  }
  element = createElementWithClass(tag, cla);
  if(obj.hasOwnProperty('id')) {
    element.id = obj.id;
  }
  if(obj.hasOwnProperty('textContent')) {
    element.textContent = obj.textContent;
  }
  if(obj.hasOwnProperty('innerHTML')) {
    element.innerHTML = obj.innerHTML;
  }
  if(obj.hasOwnProperty('tabIndex')) {
    element.tabIndex = obj.tabIndex;
  } else {
    element.tabIndex = -1;
  }
  if(obj.hasOwnProperty('children')) {
    for(let ele of obj.children) {
      element.appendChild(ele);
    }
  }
  return element;
}

/*
makeHTML( ['cat', 'dog'], {tab:'div', class:[`btn`, `btn-sm`], innerHTML: 'inner'},
  [[], {tab:'div', class:[`btn`, `btn-sm`], innerHTML: 'inner'}, {tab:'div', class:[`btn`, `btn-sm`], innerHTML: 'inner'}]
)
//*/
//第1引数: 共通して付けるクラス
//第2引数: root エレメント
//その他: rootエレメントの子要素。配列を渡すと [[class], root, child1, ...]となる
export function makeHTML(var_args) {
  if(arguments.length < 2) {
    return null;
  }
  let args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);

  let cla = args[0];
  let rootElement = makeElementFromObj(args[1], cla);

  for (let i = 2; i < args.length; i++) {
    if(Object.prototype.toString.call(args[i]) === '[object Array]') {
      let result = makeHTML(cla.concat(args[i][0]), ...args[i].slice(1));
      if(result) {
        rootElement.appendChild(result);
      }
    } else if(isNode(args[i])) {
      rootElement.appendChild(args[i]);
    } else {
      rootElement.appendChild(makeElementFromObj(args[i], cla));
    }
  }
  return rootElement;
}

export function setTabIndex(rootElement, start) {
  rootElement.tabIndex = start++;
  for(let i = 0; i < rootElement.children.length; ++i) {
    start = setTabIndex(rootElement.children[i], start);
  }
  return start;
}

//HTMLElementか判定
function isNode(node) {
  if(node instanceof HTMLElement) {
    return true;
  }
  if(node.hasOwnProperty('nodeName')) {
    return true;
  }
  if(node.hasOwnProperty('nodeType') && node.nodeType === 1) {
    return true;
  }
  return false;
}

export function toggleDisabled(ele, state) {
  for (let i = 0; i < ele.length; i++) {
    if(state) {
      ele[i].disabled = true;
    } else {
      ele[i].disabled = false;
    }
  }
}

export function toggleDisplayNone(ele, state) {
  for (let i = 0; i < ele.length; i++) {
    if(state) {
      ele[i].style = "display:none";
    } else {
      ele[i].style = "display:";
    }
  }
}

export function setTargetProperty(target, property) {
  return (val) => {
    target[property] = val;
  };
}

export function setEventListenerClickAndEnter(element, func, useCapture){
  element.addEventListener('click', func, useCapture);
  element.addEventListener('keydown', func, useCapture);
  return [[element, 'click', func, useCapture], [element, 'keydown', func, useCapture]];
}

export function setEventListener(element, eventType, func, useCapture) {
  element.addEventListener(eventType, func, useCapture);
  return [element, eventType, func, useCapture];
}

export function disposeEventListeners(eventListeners) {
  for (let i = 0; i < eventListeners.length; i++) {
    if(Object.prototype.toString.call(eventListeners[i][0]) === '[object Array]') {
      disposeEventListeners(eventListeners[i]);
    } else {
      eventListeners[i][0].removeEventListener(eventListeners[i][1], eventListeners[i][2], eventListeners[i][3]);
    }
  }
}

//
export function returnValueIfEmpty(str, value) {
  if(typeof str === 'undefined' || str === null || str === '') {
    return value;
  }
  return str;
}

export function isNotEmpty(obj) {
  if(typeof obj === 'undefined' || obj === null) {
    return false;
  }
  return true;
}

export function isEmptyString(str) {
  if(typeof str === 'undefined' || str === null || str === '') {
    return true;
  }
  return false;
}

export function checkVal(val, defaultVal) {
  if(typeof val !== 'undefined') {
    return val;
  }
  return defaultVal;
}

//shallowCopyTargetProperty(target, source, property1, ...)
export function shallowCopyTargetProperty(target, source) {
  let properties = Object.keys(target);

  for(let i = 0; i < properties.length; ++i) {
    if(source.hasOwnProperty(properties[i])) {
      target[properties[i]] = source[properties[i]];
    }
  }
}

//オブジェクトの配列から、プロパティのみの配列を返す
export function getPropertyArrayFromObjArray(arrayObj, property) {
  let temp = [];

  for(let i = 0; i < arrayObj.length; ++i) {
    temp.push(arrayObj[i][property]);
  }
  return temp;
}

export function toArrayBuffer(buf) {
  let ab = new ArrayBuffer(buf.length);
  let view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}

export function toBuffer(ab) {
  let buf = new Buffer(ab.byteLength);
  let view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

/*
file
*/

export function isFileExist(path) {
  return new Promise((resolve, reject) => {
    fs.open(path, 'r', (err, fd) => {
      if(!err) {
        resolve(true);
        return;
      }
      if(err.code === "ENOENT") {
        resolve(false);
        return;
      }
      reject(err);
    });
  });
}

export function mkDir(path) {
  return new Promise((resolve, reject) => {
    fs.open(path, 'r', (err, fd) => {
      if(!err) {
        resolve(fd);
        return;
      }

      if(err.code === "ENOENT") {
        fs.mkdirSync(path);
        resolve(fd)
        return;
      }
      reject(err);
    });
  });
}

/*
function setDefault(obj, property, value) {
  if(!obj.hasOwnProperty(property)) {
    option[property] = value;
  }
}
//*/
