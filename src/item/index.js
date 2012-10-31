module.exports = Item

require('./item.css').init()

function Item (menu, options) {
	this.parent = menu
	this.view = document.createElement('li')
	this.$el = $(this.view)
		.append(this.template(options))
		.addClass('item')
	this.bind()
}

Item.prototype = Object.create(require('Emitter').prototype, {constructor: {value: Item}})

Item.prototype.template = require('./item.hbs')

Item.prototype.bind = function() {
	this.$el.on('click', this.trigger.bind(this))
}

Item.prototype.unbind = function () {
	this.$el.off('click')
}

Item.prototype.remove = function() {
	this.$el.remove()
	return this.off()
}

Item.prototype.trigger = function () {
	var name = this.$el
		.find('.title')
		.text()
		.toLowerCase()
		.trim()
		.replace(/\s+/, '-')
	this.publish('select', name)
}

Item.prototype.toggleSelect = function() {
	if (this.$el.hasClass('selected')) {
		this.$el.removeClass('selected')
		this.publish('deselect')
	} else {
		this.$el.addClass('selected')
		this.publish('select')
	}
	return this
}

Item.prototype.focus = function () {
	if (!this.$el.hasClass('focused')) {
		this.$el.addClass('focused')
		this.publish('focus')
	}
	return this
}

Item.prototype.isFocused = function () {
	return this.$el.hasClass('focused')
}

Item.prototype.blur = function() {
	if (this.$el.hasClass('focused')) {
		this.$el.removeClass('focused')
		this.publish('blur')
	}
	return this
}

Item.prototype.title = function (string) {
	this.$el.find('.title').text(string)
	return this
}

Item.prototype.icon = function(path) {
	var img = document.createElement('img')
	$(img).attr('src', path)
	this.$el.find('.icon').append(img)
	return this
}

Item.prototype.insert = function() {
	return this.parent.add(this)
}
