# ContextMenu

  ContextMenu interface component. It enables you to quickly and fluently construct a contextmenu from javascript. All behaviour users expect from a contextmenu is build it. When a user selects an item it emits an event on the context node (the one that had the contextmenu triggered within). Thats all. This is a departure from other implementations which will house a set of handlers internally. Emitting dom events is simpler and offers greater opportunity for composition.

  ![context menu component](https://raw.github.com/jkroso/contextmenu/master/Screenshot.png)

## Installation

```
$ component install jkroso/contextmenu
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
    .pop()
  .item('Paste', 'images/paste.png')
  .show(100, 100)
```

## API  - [ContextMenu()](#contextmenu)
  - [ContextMenu.instances](#contextmenuinstances)
  - [ContextMenu.clear()](#contextmenuclear)
  - [ContextMenu.new()](#contextmenunew)
  - [ContextMenu.item()](#contextmenuitem)
  - [ContextMenu.onFocused()](#contextmenuonfocused)
  - [ContextMenu.onBlurred()](#contextmenuonblurred)
  - [ContextMenu.onHover()](#contextmenuonhover)
  - [ContextMenu.onLeave()](#contextmenuonleave)
  - [ContextMenu.onKeydown()](#contextmenuonkeydown)
  - [ContextMenu.onMousedown()](#contextmenuonmousedown)
  - [ContextMenu.hasFocus()](#contextmenuhasfocus)
  - [ContextMenu.onMouseover()](#contextmenuonmouseover)
  - [ContextMenu.onFocusin()](#contextmenuonfocusin)
  - [ContextMenu.onFocusout()](#contextmenuonfocusout)
  - [ContextMenu.focusedItem()](#contextmenufocuseditem)
  - [ContextMenu.focusedMenu()](#contextmenufocusedmenu)
  - [ContextMenu.getFocused()](#contextmenugetfocused)
  - [ContextMenu.up()](#contextmenuup)
  - [ContextMenu.down()](#contextmenudown)
  - [ContextMenu.navigate()](#contextmenunavigatedirectionstring)
  - [ContextMenu.activate()](#contextmenuactivate)
  - [ContextMenu.deactivate()](#contextmenudeactivate)
  - [ContextMenu.toggleSelect()](#contextmenutoggleselect)
  - [ContextMenu.show()](#contextmenushow)
  - [ContextMenu.remove()](#contextmenuremove)

## ContextMenu()

  Create a new ContextMenu
  
```js
new ContextMenu(document.body)
```

## ContextMenu.instances

  Holds all instances

## ContextMenu.clear()

  Remove all instances from the display

## ContextMenu.new()

  Alternative constructor syntax

## ContextMenu.item()

  Forward the item menu building functions on to the menu

## ContextMenu.onFocused()

  Handle an item being focused

## ContextMenu.onBlurred()

  Handle an item loosing focus

## ContextMenu.onHover()

  Handle the mouse entering an item

## ContextMenu.onLeave()

  Handle the mouse leaving an item

## ContextMenu.onKeydown()

  Translate the keypress into a command

## ContextMenu.onMousedown()

  Prevent default behaviors

## ContextMenu.hasFocus()

  Check if the ContextMenu is currently focused and therefore receiving events

## ContextMenu.onMouseover()

  Transfer focus to the item being hovered over

## ContextMenu.onFocusin()

  Set focus state

## ContextMenu.onFocusout()

  Remove focus state

## ContextMenu.focusedItem()

  Get the most focused item

## ContextMenu.focusedMenu()

  Get the most focused menu

## ContextMenu.getFocused()

  List all Items that are in a focused state

## ContextMenu.up()

  Shift focus to the item above the currently focused one

## ContextMenu.down()

  Shift focus to the item below the currently selected one

## ContextMenu.navigate(direction:String)

  Convert a left or right command into the appropriate action

## ContextMenu.activate()

  Ensure the ContextMenu has keyboard focus so it can receive keyboard events

## ContextMenu.deactivate()

  Remove focus so the ContextMenu no longer receives keyboard events

## ContextMenu.toggleSelect()

  Toggle the selection state of the currently focused item

## ContextMenu.show()

  Insert the context menu and show it

## ContextMenu.remove()

  Terminate the ContextMenu

## Release History

_none yet_

## License
Copyright (c) 2012 Jakeb Rosoman

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
