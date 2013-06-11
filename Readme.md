# ContextMenu

  ContextMenu interface component. It enables you to quickly and fluently construct a contextmenu from javascript. All behaviour users expect from a contextmenu is build it. When a user selects an item it emits an event on the context node (the one that had the contextmenu triggered within). Thats all. This is a departure from other implementations which will house a set of handlers internally. Emitting dom events is simpler and offers greater opportunity for composition.

  ![context menu component](https://raw.github.com/jkroso/contextmenu/master/Screenshot.png)

## Installation


_With [component](//github.com/component/component), [packin](//github.com/jkroso/packin) or [npm](//github.com/isaacs/npm)_  

    $ {package mananger} install jkroso/contextmenu

then in your app:

```js
var ContextMenu = require('contextmenu')
```

## Features

  - events for composition
  - structural CSS letting you decide on style
  - fluent API
  - arrow key navigation
  - mouse navigation
  - auto arranges to find space
  - can nest menus as deep as you please

## Events

  - `show` when shown
  - `hide` when hidden
  - `select` when an item is chosen
  - `focused` when an item is focus
  - `blurred` when an item looses focus
  - `focus` when the context menu starts receiving keyboard events
  - `blur` when the context menu stops receiving keyboard events

And on the context node the events are derived from the item titles

## Example

This is the code that rendered the screenshot

```js
var ContextMenu = require('contextmenu')

new ContextMenu(document.body)
  .item('Cut', 'images/cut.png')
  .submenu('Copy', 'images/copy.png')
    .item('title')
    .item('body')
    .item('image')
    .pop()
  .item('Paste', 'images/paste.png')
  .show(100, 100)
```

## API

  - [ContextMenu()](#contextmenu)
  - [ContextMenu.clear()](#contextmenuclear)
  - [ContextMenu.item()](#contextmenuitem)
  - [ContextMenu.submenu()](#contextmenusubmenu)
  - [ContextMenu.hasFocus()](#contextmenuhasfocus)
  - [ContextMenu.up()](#contextmenuup)
  - [ContextMenu.down()](#contextmenudown)
  - [ContextMenu.navigate()](#contextmenunavigateleftrightstring)
  - [ContextMenu.activate()](#contextmenuactivate)
  - [ContextMenu.deactivate()](#contextmenudeactivate)
  - [ContextMenu.show()](#contextmenushow)
  - [ContextMenu.target()](#contextmenutargetxnumberynumber)
  - [ContextMenu.remove()](#contextmenuremove)

### ContextMenu()

  Create a new ContextMenu
  
```js
new ContextMenu(document.body)
```

### ContextMenu.clear()

  Remove all instances from the display

### ContextMenu.item()

  add an item

### ContextMenu.submenu()

  create a submenu

### ContextMenu.hasFocus()

  Check if the ContextMenu is currently focused and therefore receiving events

### ContextMenu.up()

  Shift focus to the item above the currently focused one

### ContextMenu.down()

  Shift focus to the item below the currently selected one

### ContextMenu.navigate(left/right:String)

  Convert a left or right command into the appropriate action

### ContextMenu.activate()

  Ensure the ContextMenu has keyboard focus so it can receive keyboard events

### ContextMenu.deactivate()

  Remove focus so the ContextMenu no longer receives keyboard events

### ContextMenu.show()

  Insert the context menu and show it

### ContextMenu.target(x:Number, y:Number)

  set location

### ContextMenu.remove()

  Terminate the ContextMenu
