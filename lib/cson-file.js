"use babel";

import cson from "cson";
import fs from "fs";
import { unicodeEscapeSequenceToChar } from "./utilities/utility";

export class RPCFindOptions {
  constructor(findOption) {
    this.description = findOption && findOption.hasOwnProperty("description") ? findOption.description : "";
    this.findPattern = findOption && findOption.hasOwnProperty("findPattern") ? findOption.findPattern : "";
    this.replacePattern = findOption && findOption.hasOwnProperty("replacePattern") ? findOption.replacePattern : "";
    this.pathsPattern = findOption && findOption.hasOwnProperty("pathsPattern") ? findOption.pathsPattern : "";
    this.projectFind = findOption && findOption.hasOwnProperty("projectFind") ? findOption.projectFind : false;
    this.useRegex = findOption && findOption.hasOwnProperty("useRegex") ? findOption.useRegex : false;
    this.caseSensitive = findOption && findOption.hasOwnProperty("caseSensitive") ? findOption.caseSensitive : false;
    this.wholeWord = findOption && findOption.hasOwnProperty("wholeWord") ? findOption.wholeWord : false;
    this.inCurrentSelection = findOption && findOption.hasOwnProperty("inCurrentSelection") ?
      findOption.inCurrentSelection : false;
  }
}

function stringToCson(data, objName) {
  let obj = cson.parse(unicodeEscapeSequenceToChar(data));

  if (obj instanceof Error) {
    return obj;
  }
  if (!obj.hasOwnProperty(objName)) {
    return null;
  }

  let options = [];
  obj = obj[objName];
  for (let option of obj.options) {
    let temp = new RPCFindOptions();

    Object.assign(temp, option);
    options.push(temp);
  }
  return options;
}

export function readFromCson(path, objName, resolved, rejected) {
  if (path === null) {
    return;
  }
  let promise = new Promise((resolve, reject) => {
    fs.readFile(path, "utf-8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      let result = stringToCson(data, objName);

      if (result instanceof Error) {
        reject(result);
        return;
      }
      resolve(result);
    });
  });
  promise.then(resolved, rejected); //.catch(rejected);
}

export function writeToCson(path, obj, resolved, rejected) {
  let data = cson.createCSONString(obj, { "indent": "  " });
  let promise = new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
  promise.then(resolved, rejected);
}
