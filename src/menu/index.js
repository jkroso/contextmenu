var Item = require('./item')
  , Satellite = require('satellite')
  , css = require('css')
  , style = require('computed-style')
  , enumerable = require('enumerable')

exports = module.exports = Menu

function Menu () {
	Satellite.call(this, require('./template'))
	this.classList.add('menu')
	this.prefer('north east')
	this.items = enumerable([])
	this.lens = this.view.querySelector('.lens')
	this.on('show')
	this.on('hide')
}

/**
 * Inherit from Satellite
 */
var proto = Menu.prototype = Object.create(Satellite.prototype)
proto.constructor = Menu

/**
 * Insert a new Item instance
 *
 * @param {Item} item
 * @return {Self}
 */
proto.insert = function (item) {
	this.items.add(item)
	this.view.appendChild(item.view)
	var self = this
	item.events.on('focused', function () {
		self.showLens()
		self.setLens(item)
	})
	item.events.on('blurred', function () {
		if (!self.focusedItem())
			self.hideLens()
	})
	this.events.emit('add', {item:item})
	return this
}

/*!
 * Allow enumerable to handle NodeLists
 */
enumerable.implement(NodeList)

/*!
 * Since the actual Contextmenu node has no size the menus will try and be as skinny 
 * as possible. This is undesirable since menu items should usually not be broken 
 * into several lines. To fix this we must set the menus width explicitly.
 */
proto.onShow = function () {
	css(this.view, {visibility:'visible'})
	var max = this.items.max(function (item) {
		return enumerable(item.view.childNodes).sum(function (child) {
			var css = style(child)
			if (css.position !== 'static') return 0
			return (parseFloat(css.marginRight) || 0)
				+ (parseFloat(css.marginLeft)  || 0)
				+ child.offsetWidth
		})
	})
	max += 'px'
	this.items.each(function (item) {
		item.view.style.width = max
	})
}

/**
 * Elements need to be properly hidden in order to prevent events being fired on them unexpectedly
 */
proto.onHide = function () {
	css(this.view, {visibility:'hidden'})
}

/**
 * Ensure at least one item has focus
 * @return {Self}
 */
proto.focus = function () {
	if (!this.focusedItem())
		this.items.at(0).focus()
}

/**
 * Shift focus to the item before the focused item
 */
proto.prev = function () {
	var item = this.focusedItem()
	var i = this.items.indexOf(item)
	var next = Math.max(0, i - 1)
	if (i !== next) {
		item.blur()
		this.items.at(next).focus()
	}
}

/**
 * Shift focus to the item after the focused item
 */
proto.next = function () {
	var item = this.focusedItem()
	var i = this.items.indexOf(item)
	var next = Math.min(this.items.length() - 1, i + 1)
	if (i !== next) {
		item.blur()
		this.items.at(next).focus()
	}
}

/**
 * Is the menu displayed on the screen
 *
 * @return {Boolean}
 */
proto.isVisible = function () {
	return !this.classList.has('satellite-hide')
}

/**
 * Create a new entry in the menu
 *
 *   menu.item('edit', './images/edit.png')
 *   
 * @param {String} title
 * @param {String} [icon] path to an image
 * @return {Self}
 */
proto.item = function(title, icon) {
	return this.insert(new Item(this, {title:title, icon:icon}))
}

/**
 * Insert a new item which contains a menu
 * 
 * @see #item()
 * @return {Menu} the submenu of the newly created item 
 */
proto.submenu = function (title, icon) {
	var item = new Item(this, {title:title, icon: icon})
	item.menu = new Menu
	item.menu.parent = item
	var self = this
	item.menu.pop = function () {return self}
	item.menu
		.appendTo(item.view)
		.orbit(item.view)
	this.insert(item)
	return item.menu
}

/**
 * Create a new item but don't insert it yet
 *
 * @return {Item}
 */
proto.newItem = function () {
	return new Item(this)
}

/**
 * Reposition the lens to cover the given item
 *
 * @param {Item} item
 * @return {Self}
 */
proto.setLens = function (item) {
	var target = item.view
	css(this.lens, {
		top: target.offsetTop,
		height: target.offsetHeight
	})
	return this
}

/**
 * Show the menu's lens
 * @return {Self}
 */
proto.showLens = function () {
	css(this.lens, {visibility: 'visible'})
	return this
}

/**
 * Hide the menu's lens
 * @return {Self}
 */
proto.hideLens = function () {
	css(this.lens, {visibility: 'hidden'})
	return this
}

/**
 * Get the menu item which currently has focus
 *
 * @return {Item}
 */
proto.focusedItem = function () {
	return this.items.find(function (item) {
		return item.isFocused()
	})
}

/**
 * Remove the menu from the DOM
 * 
 * @return {Self}
 */
proto.remove = function() {
	this.items.each('remove')
	Satellite.prototype.remove.call(this)
	return this
}