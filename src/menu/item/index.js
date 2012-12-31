var domify = require('domify')
  , classes = require('classes')
  , EventManager = require('event-manager')

module.exports = Item

/**
 * A menu item
 *
 * @event hover when the mouse enter the item
 * @event leave when the mouse leaves the item
 * @event focused when the item is switched to a focused state
 * @event blurred when the item looses its focused state
 */
function Item (menu, options) {
	this.parent = menu
	this.view = domify(require('./template'))[0]
	this.classList = classes(this.view)
	this.events = new EventManager(this.view, this)
	this.events.on('mousedown', 'toggleSelect')
	this.events.on('mouseover')
	this.events.on('mouseout')
	if (options) {
		options.title && this.title(options.title)
		options.icon && this.icon(options.icon)
	}
}

/**
 * Inherit from Emitter
 */
var proto = Item.prototype

/**
 * Set the item to selected state and emit and event
 * @return {Self}
 */
proto.select = function () {
	this.classList.add('selected')
	this.events.emit('select', {view:this})
	return this
}

/**
 * Determine if it was a hover action
 */
proto.onMouseover = function (e) {
	if (e.target === this.view && !isIn(e.relatedTarget, this.view))
		this.events.emit('hover', {view:this})
}

/**
 * Determine if it was a leave action
 */
proto.onMouseout = function (e) {
	if (e.target === this.view && !isIn(e.relatedTarget, this.view))
		this.events.emit('leave', {view:this})
}

function isIn (child, parent) {
	if (!child || child === parent) return false
	while (child = child.parentElement) {
		if (child === parent) return true
	}
	return false
}

/**
 * Negate the items selection state
 * @return {Self}
 */
proto.toggleSelect = function() {
	return this[
		this.isSelected()
			? 'deselect' 
			: 'select'
	]()
}

/**
 * Remove select state an emit an event
 * @return {Self}
 */
proto.deselect = function () {
	this.classList.remove('selected')
	this.events.emit('deselect', {view:this})
	return this
}

/**
 * Get focus state
 * @return {Boolean}
 */
proto.isSelected = function () {
	return this.classList.has('selected')
}

/**
 * Add focused state and emit event
 * @return {Self}
 */
proto.focus = function () {
	if (!this.isFocused()) {
		this.classList.add('focused')
		this.events.emit('focused', {view:this})
	}
	return this
}

/**
 * Get focus state
 * @return {Boolean}
 */
proto.isFocused = function () {
	return this.classList.has('focused')
}

/**
 * Remove focus state and emit an event
 * @return {Self}
 */
proto.blur = function() {
	if (this.isFocused()) {
		this.classList.remove('focused')
		this.events.emit('blurred', {view:this})
	}
	return this
}

/**
 * Get or set the items title
 *
 *   item.title('lewis') // => item
 *   item.title() // => 'lewis'
 *   
 * @param {String} [title] the title to set
 * @return {String|Self}
 */
proto.title = function (string) {
	this.slug = createSlug(string)
	var title = this.view.querySelector('.title')
	if (string != null) {
		title.innerText = string
		return this
	}
	else {
		return title.innerText
	}
}

/**
 * Insert an icon image
 *
 * @param {String} path
 * @return {Self}
 */
proto.icon = function(path) {
	var icon = this.view.querySelector('.icon')
	var img = document.createElement('img')
	img.src = path
	icon.innerHTML = ''
	icon.appendChild(img)
	return this
}

/**
 * Show the submenu associated with this item
 */
proto.open = function () {
	if (this.menu) {
		this.menu.show()
	}
}

/**
 * Hide the submenu associated with this item
 */
proto.close = function () {
	if (this.menu) this.menu.hide()
}

/**
 * Insert the item into its designated parent
 * @return {Menu} the containing menu
 */
proto.end = function() {
	return this.parent.add(this)
}

/**
 * Terminate the item
 * @return {Self}
 */
proto.remove = function() {
	this.events.clear()
	return this
}

/**
 * Generate a slug from `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function createSlug(str) {
	return String(str)
		.toLowerCase()
		.trim()
		.replace(/ +/g, '-')
		.replace(/[^a-z0-9\-]/g, '')
}