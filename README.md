# replacing-pattern-collection package

This package helps using find-and-replace.  
If you often use same complex pattern in find-and-replace, this package is helpful.  
This package save patterns to file, and load patterns from file.  

![demo](https://raw.githubusercontent.com/BlueSilverCat/replacing-pattern-collection/master/replacing-pattern-collection.gif?raw=true)

This package use the CSON npm package.

# How to use

1.  Set defaultFilePath.
2.  Toggle view. default key is `F6`
3.  Control with UI.

# User interface

![User interface](https://raw.githubusercontent.com/BlueSilverCat/replacing-pattern-collection/master/user-interface.png?raw=true)

1.  Read patterns from file.
2.  Write patterns to file.
3.  Open patterns file.
4.  File path will be used to Read/Write.
5.  Close this panel.
6.  Get patterns form find-and-replace panel. add new empty patterns when find-and-replace panel is not opened.
7.  Set patterns to find-and-replace panel.
8.  Delete pattern.
9.  Flag of ProjectFind.
10. Flag of UseRegex.
11. Flag of MatchCase.
12. Flag of Only In Selection.
13. Flag of WholeWord.
14. Set first pattern to this panel.
15. Set previous patern to thi panel.
16. Current pattern / Set Nth pattern to this panel.
17. Number of patterns.
18. Set next pattern to this panel.
19. Set last pattern to this panel.
20. Discription of pattern.
21. Pattern will be used to find.
22. Pattern will be used to replace.
23. Pattern will be used to filter file/directory.

# Commands and Key binds

-   `F6`: `replacing-pattern-collection:toggle`  
    Open panel.  
-   `escape` :  
    Close panel.  
-   `enter` :  
    Pressing enter when focused on the button is equivalent to clicking the button.
-   `tab`: `replacing-pattern-collection:focusNext`  
    Focus next element.  
-   `shift-tab`: `replacing-pattern-collection:focusPrevious`  
    Focus previous element.  
-   `pagedown`: `replacing-pattern-collection:next`  
    Set next pattern to panel.  
-   `end`: `replacing-pattern-collection:last`  
    Set last pattern to panel.  
-   `pageup`: `replacing-pattern-collection:previous`  
    Set previous pattern to panel.  
-   `home`: `replacing-pattern-collection:first`  
    Set first pattern to panel.  
-   `insert`: `replacing-pattern-collection:set`
    Set pattern to find-and-replace panel.  

# About CSON file

If you want to edit CSON file, edit as below.  

```.coffee
"replacing-pattern-collection":
  options: [
    {
      description : 'remove empty line'
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

-   description : String. description of pattern.
-   findPattern : String. this will be used to find.
-   replacePattern : String. this will be used to replace.
-   pathsPattern : String. this will be used to filter file/directory.
-   projectFind : Boolean. If you use projectFind, set this to true.
-   useRegex : Boolean.  If you use regex search , set this to true.
-   caseSensitive : Boolean. If you use case sensitive search , set this to true.
-   wholeWord : Boolean. If you use whole word search , set this to true.
-   inCurrentSelection : Boolean. If you use search in current selection, set this to true.
