
var Menu = require('./menu')
  , customEvent = require('dom-event').custom
  , DomEmitter = require('dom-emitter')
  , position = require('position')
  , classes = require('classes')
  , domify = require('domify')

exports = module.exports = ContextMenu

/**
 * Create a new ContextMenu
 *
 *   new ContextMenu(document.body)
 *   
 * @param {Element} target where to send the command
 * @return {ContextMenu}
 */

function ContextMenu (target) {
	ContextMenu.instances.push(this)
	this.targetNode = target
	this.view = domify(require('./template'))
	this.classList = classes(this.view)
	this.events = new DomEmitter(this.view, this)
		.on('keydown')
		.on('mousedown')
		.on('hover .item')
		.on('leave .item')
		.on('click')
		.on('mouseover', 'activate')
		.on('focusin')
		.on('focusout')
		.on('focused .item')
		.on('blurred .item')
		.on('select')
	this.menu = new Menu()
		.appendTo(this.view)
		.orbit(this.view)
	this.menu.parent = this
}

/**
 * Holds all instances
 */

ContextMenu.instances = []

/**
 * Remove all instances from the display
 */

ContextMenu.clear = function () {
	ContextMenu.instances.forEach(function (menu) {
		menu.remove()
	})
	ContextMenu.instances.length = 0
}

/**
 * Forward the item menu building functions on to the menu
 */

ContextMenu.prototype.item = function () {
	this.menu.item.apply(this.menu, arguments)
	return this
}

/**
 * create a submenu
 * @return {Menu}
 */

ContextMenu.prototype.submenu = function () {
	var menu = this.menu.submenu.apply(this.menu, arguments)
	var self = this
	menu.pop = function () { return self }
	return menu
}

/**
 * "select" event handler
 * @param {Event} e
 */

ContextMenu.prototype.onSelect = function (e) {
	var item = e.view
	var topic = [item.title()]
	var menu = item.parent
	while (menu !== this.menu) {
		item = menu.parent
		menu = item.parent
		topic.unshift(item.title())
	}
	this.targetNode.dispatchEvent(customEvent(
		topic.join('/').toLowerCase()
	))
	this.remove()
}

/**
 * Handle an item being focused
 */

ContextMenu.prototype.onFocused = function (e) {
	e.view.menu && e.view.open()
}

/**
 * Handle an item loosing focus
 */

ContextMenu.prototype.onBlurred = function (e) {
	e.view.menu && e.view.close()
}

/**
 * "hover" event handler
 */

ContextMenu.prototype.onHover = function (e) {
	var top = e.view.parent.focusedItem()
	// If an item in the current menu is selected...
	if (top) {
		// ... blur it and all its children
		var focusedItems = this.getFocused()
		  , i = focusedItems.length
		while (i--) {
			var focused = focusedItems[i]
			focused.blur()
			if (focused === top) break
		} 
	}
	e.view.focus()
}

/**
 * Handle the mouse leaving an item
 */

ContextMenu.prototype.onLeave = function (e) {
	e.view.blur()
}

/**
 * Translate the keypress into a command
 */

ContextMenu.prototype.onKeydown = function (e) {
	// Stop scrolling and page refreshes
	e.preventDefault()
	switch (e.which) {
		// down
		case 40: return this.down()
		// up
		case 38: return this.up()
		// left
		case 37: return this.navigate('left')
		// right
		case 39: return this.navigate('right')
		// enter
		case 13: return this.toggleSelect()
	}
}

/**
 * Prevent default behaviors
 */

ContextMenu.prototype.onClick =
ContextMenu.prototype.onMousedown = function (e) {
	e.preventDefault()
}

/**
 * Check if the ContextMenu is currently focused and therefore receiving events
 * @return {Boolean}
 */

ContextMenu.prototype.hasFocus = function () {
	return this.classList.has('focused')
}

/**
 * Transfer focus to the item being hovered over
 */

ContextMenu.prototype.onMouseover = function (e) {
	var target = e.delegateTarget

	if (target && target !== this.focusedItem())
		target.focus()
}

/**
 * Set focus state
 */

ContextMenu.prototype.onFocusin = function (e) {
	if (!this.focusedItem) this.focusedItem = this.menu.list.at(0)
	this.classList.add('focused')
	console.log('focus in')
}

/**
 * Remove focus state
 */

ContextMenu.prototype.onFocusout = function (e) {
	this.classList.remove('focused')
	console.log('focus out')
}

/**
 * Get the most focused item
 * @return {Item}
 */

ContextMenu.prototype.focusedItem = function () {
	var list = this.getFocused()
	return list[list.length - 1]
}

/**
 * Get the most focused menu
 */

ContextMenu.prototype.focusedMenu = function () {
	var item = this.focusedItem()
	return item && item.parent
}

/**
 * List all Items that are in a focused state
 * @return {Array} of Items
 */

ContextMenu.prototype.getFocused = function () {
	var menu = this.menu
	var res = []
	while (menu) {
		var item = menu.focusedItem()
		if (!item) break
		res.push(item)
		menu = item.menu
	}
	return res
}

/**
 * Shift focus to the item above the currently focused one
 */

ContextMenu.prototype.up = function () {
	this.focusedMenu().prev()
}

/**
 * Shift focus to the item below the currently selected one
 */

ContextMenu.prototype.down = function () {
	this.focusedMenu().next()
}

/**
 * Convert a left or right command into the appropriate action
 * @param {String} direction of the command
 */

ContextMenu.prototype.navigate = function (direction) {
	var item = this.focusedItem()
	// Is there a submenu available
	if (item.menu && item.menu.isVisible()) {
		// if the submenu is to the right of the currently focused item...
		if (position(item.menu.view).left >= position(item.view).left) {
			// ...then a right button push would be the user trying to navigate to it
			if (direction === 'right') {
				item.menu.focus()
			}
			// ...and a left key down would be the user trying to navigate up
			else
				if (item.parent !== this.menu) item.blur()
		} 
		// otherwise it must be open to the left of the focused item...
		else {
			// ...then a right key down will be interpreted as the user trying to hide it
			if (direction === 'right') {
				if (item.parent !== this.menu) item.blur()
			}
			// ...and a left key down would be the user trying navigate to it
			else
				item.menu.focus()
		}
	}
	else {
		var menu = item.parent
		var parentMenu = menu.parent
		// If the focused menu is to the right of its parent
		if (position(menu.view).left >= position(parentMenu.view).left) {
			// then we interpret a right key as request to show any submenus that might exist
			if (direction === 'right') {
				if (item.menu) item.menu.show()
			}
			// and a left key as a request to navigate up the menu tree
			else
				if (menu !== this.menu) {
					item.blur()
				}
		}
		// otherwise it'll be opened to the left
		else {
			// so a right will be navigating up the menu tree
			if (direction === 'right') {
				if (item.parent !== this.menu) {
					item.blur()
				}
			}
			// and a left key will be looking for submenus
			else
				if (item.menu) item.menu.show()
		}
	}
}

/**
 * Ensure the ContextMenu has keyboard focus so it can receive keyboard events
 * @return {Self}
 */

ContextMenu.prototype.activate = function () {
	if (!this.hasFocus()) {
		var x = window.scrollX
		  , y = window.scrollY
		this.view.focus()
		// To prevent the focus event causing scrolling
		window.scrollTo(x, y)
	}
	return this
}

/**
 * Remove focus so the ContextMenu no longer receives keyboard events
 * @return {Self}
 */

ContextMenu.prototype.deactivate = function () {
	this.view.blur()
	return this
}

/**
 * Toggle the selection state of the currently focused item
 */

ContextMenu.prototype.toggleSelect = function () {
	this.focusedItem().toggleSelect()
}

/**
 * Insert the context menu and show it
 */

ContextMenu.prototype.show = function (x, y) {
	document.body.appendChild(this.view)
	if (x != null) this.target.apply(this, arguments)
	this.menu.show()
	this.menu.focus()
	this.activate()
}

ContextMenu.prototype.target = function (x, y) {
	this.view.style.left = x+'px'
	this.view.style.top = y+'px'
}

/**
 * Terminate the ContextMenu
 */

ContextMenu.prototype.remove = function () {
	var self = this
	exports.instances = exports.instances.filter(function (i) {return i !== self}) 
	this.deactivate()
	this.clear()
	this.view.parentElement.removeChild(this.view)
}
