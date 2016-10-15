# replacing-pattern-collection package

This package helps using find-and-replace.  
If you often use same complex pattern in find-and-replace, this package is helpful.  
This package save patterns to file, and load patterns from file.  

![demo](https://raw.githubusercontent.com/BlueSilverCat/replacing-pattern-collection/master/replacing-pattern-collection.gif?raw=true)

This package use the CSON npm package.

# How to use

1. Set defaultFilePath.

2. Toggle view. default key is `F4`

3. Control with UI.

![User interface](https://raw.githubusercontent.com/BlueSilverCat/replacing-pattern-collection/master/user-interface.png?raw=true)

# About CSON file
If you want to edit CSON file, edit as below.  
```.coffee
"replacing-pattern-collection":
  options: [
    {
      findPattern: "^(\\r\\n)"
      replacePattern: ""
      pathsPattern: ""
      projectFind: false
      useRegex: true
      caseSensitive: false
      wholeWord: false
      inCurrentSelection: false
    }
  ]
```
* findPattern : String. this will be used to find.
* replacePattern : String. this will be used to replace.
* pathsPattern : String. this will be used to filter file/directory.
* projectFind : Boolean. If you use projectFind, set this to true.
* useRegex : Boolean.  If you use regex search , set this to true.
* caseSensitive : Boolean. If you use case sensitive search , set this to true.
* wholeWord : Boolean. If you use whole word search , set this to true.
* inCurrentSelection : Boolean. If you use search in current selection, set this to true.

# TODO
Improve user interface.  
