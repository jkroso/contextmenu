
var style = require('computed-style')
  , Satellite = require('satellite')
  , inherit = require('inherit')
  , detect = require('detect')
  , Item = require('./item')
  , max = require('max')
  , sum = require('sum')
  , css = require('css')

exports = module.exports = Menu

function Menu () {
	Satellite.call(this, require('./template'))
	this.classList.add('menu')
	this.prefer('north east')
	this.items = []
	this.lens = this.view.querySelector('.lens')
	this.events.on('show')
	this.events.on('hide')
}

/**
 * Inherit from Satellite
 */

inherit(Menu, Satellite)
	
/**
 * Insert a new Item instance
 *
 * @param {Item} item
 * @return {Self}
 */

Menu.prototype.insert = function (item) {
	this.items.push(item)
	this.view.appendChild(item.view)
	var self = this
	item.events
		.on('focused', function () {
			self.showLens()
			self.setLens(item)
		})
		.on('blurred', function () {
			if (!self.focusedItem())
				self.hideLens()
		})
	this.events.emit('add', {item:item})
	return this
}

/**
 * Since the actual Contextmenu node has no size the menus will try and be as skinny 
 * as possible. So we set the menus width explicitly
 */

Menu.prototype.onShow = function (e) {
	e.stopPropagation()
	// ensure visible
	css(this.view, {visibility:'visible'})
	// biggest item
	var width = max(this.items, function(item){
		return sum(item.view.childNodes, elWidth)
	})
	this.items.forEach(function(item){
		item.view.style.width = width + 'px'
	})
}

/**
 * calculate the width of `el`
 * 
 * @param {Element} child
 * @return {Number}
 * @api private
 */

function elWidth(child){
	var css = style(child)
	if (css.position != 'static') return 0
	return (parseFloat(css.marginRight) || 0)
		+ (parseFloat(css.marginLeft)  || 0)
		+ child.offsetWidth
}

/**
 * Elements need to be properly hidden in order to prevent events being fired on them unexpectedly
 */

Menu.prototype.onHide = function (e) {
	e.stopPropagation()
	css(this.view, {visibility:'hidden'})
}

/**
 * Ensure at least one item has focus
 * @return {Self}
 */

Menu.prototype.focus = function () {
	if (!this.focusedItem()) this.items[0].focus()
}

/**
 * Shift focus to the item before the focused item
 */

Menu.prototype.prev = function () {
	var item = this.focusedItem()
	var i = this.items.indexOf(item)
	var next = Math.max(0, i - 1)
	if (i !== next) {
		item.blur()
		this.items[next].focus()
	}
}

/**
 * Shift focus to the item after the focused item
 */

Menu.prototype.next = function () {
	var item = this.focusedItem()
	var i = this.items.indexOf(item)
	var next = Math.min(this.items.length - 1, i + 1)
	if (i !== next) {
		item.blur()
		this.items[next].focus()
	}
}

/**
 * Is the menu displayed on the screen
 *
 * @return {Boolean}
 */

Menu.prototype.isVisible = function () {
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

Menu.prototype.item = function(title, icon) {
	return this.insert(new Item(this, {title:title, icon:icon}))
}

/**
 * Insert a new item which contains a menu
 * 
 * @see #item()
 * @return {Menu} the submenu of the newly created item 
 */

Menu.prototype.submenu = function (title, icon) {
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

Menu.prototype.newItem = function () {
	return new Item(this)
}

/**
 * Reposition the lens to cover the given item
 *
 * @param {Item} item
 * @return {Self}
 */

Menu.prototype.setLens = function (item) {
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

Menu.prototype.showLens = function () {
	css(this.lens, {visibility: 'visible'})
	return this
}

/**
 * Hide the menu's lens
 * @return {Self}
 */

Menu.prototype.hideLens = function () {
	css(this.lens, {visibility: 'hidden'})
	return this
}

/**
 * Get the menu item which currently has focus
 *
 * @return {Item}
 */

Menu.prototype.focusedItem = function () {
	return detect(this.items, function(item){
		return item.isFocused()
	})
}

/**
 * Remove the menu from the DOM
 * 
 * @return {Self}
 */

Menu.prototype.remove = function() {
	this.items.forEach(function(item){
		item.remove()
	})
	Satellite.prototype.remove.call(this)
	return this
}
