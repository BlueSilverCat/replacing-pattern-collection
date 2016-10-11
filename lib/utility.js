'use babel';

//////
export function doOnlySecond(first, second, f) {
  const kErr = -1;

  for (let v of second) {
    if(first.indexOf(v) === kErr) {
      f(v);
    }
  }
  return first;
}

export function checkInteger(num, minimum, maximam){
  if( Number.isInteger(num) === false || minimum&&(num < minimum) || maximam&&(num > maximam)) {
    return false;
  }
  return true;
}

export function checkBoolean(bool){
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

//{tab:'div', class:[`btn`, `btn-sm`], textContent'text', innerHTML: 'innerHTML', children: [HTMLElements]}
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
  if(obj.hasOwnProperty('children')) {
    for(let ele of obj.children) {
      element.appendChild(ele);
    }
  }
  return element;
}

/*
makeHTML( ['cat', 'dog'],
  {tab:'div', class:[`btn`, `btn-sm`], innerHTML: 'inner'},
  [{tab:'div', class:[`btn`, `btn-sm`], innerHTML: 'inner'}{tab:'div', class:[`btn`, `btn-sm`], innerHTML: 'inner'}]
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

export function setEventListener(element, eventType, func) {
  element.addEventListener(eventType, func, false);
  return [element, eventType, func];
}

export function disposeEventListeners(eventListeners) {
  for (let i = 0; i < eventListeners.length; i++) {
    eventListeners[i][0].removeEventListener(eventListeners[i][1], eventListeners[i][2], false);
  }
}
/*
function setDefault(obj, property, value) {
  if(!obj.hasOwnProperty(property)) {
    option[property] = value;
  }
}
//*/
