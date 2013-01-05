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

## API