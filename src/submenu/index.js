var Menu = require('../index'),
    Item = require('../item/index')

module.exports = Submenu

function Submenu (menu) {
    this.parent = menu
    this.view = document.createElement('li')
    this.$el = $(this.view)
        .append(this.template())
        .addClass('item submenu')
    this.contents = new Menu()
        .place('north east')
        .target(this.view)
    this.$content = this.contents.$content
}

// Inherit methods from from menu and item
Submenu.prototype = Object.create(Menu.prototype, {constructor:{value:Submenu}})
Submenu.prototype.template = require('./submenu.hbs')
Submenu.prototype.icon = Item.prototype.icon
Submenu.prototype.title = Item.prototype.title
Submenu.prototype.isFocused = Item.prototype.isFocused
Submenu.prototype.toggleSelect = Item.prototype.toggleSelect

// Shadow the normal menus add method
Submenu.prototype.add = function(item) {
    this.contents.add(item)
    return this
}

Submenu.prototype.open = function () {
    var now = this.getFocused()
    if (!now) this.contents.down()
    else this.contents.open()
    return this
}

Submenu.prototype.close = function () {
    var now = this.getFocused()
    if (now) {
        if (now instanceof Submenu) {
            now.close()
        } else {
            now.blur()
        }
    }
    return this
}

Submenu.prototype.getFocused = function () {
    return this.contents.getFocused()
}

Submenu.prototype.insert = function () {
    var parent = Item.prototype.insert.call(this)
    this.contents.appendTo(this.view)
    return parent
}

Submenu.prototype.done = function () {
    // Must be inserted before it is measured
    var parent = this.insert()
    this.fixWidth().measure()
    this.contents.$content.on('mousemove', this.domEvents.mousemove.bind(this.contents))
    return parent
}

Submenu.prototype.fixWidth = function () {
    var maxWidth = 0,
        $menu = this.contents.$content
    $menu.children('.item').each(function () {
        var width = parseInt($(this).css('padding-left'), 10) + parseInt($(this).css('padding-right'), 10)
        $(this).children().each(function () {
            width += $(this).outerWidth() 
                + parseInt($(this).css('margin-left'), 10) 
                + parseInt($(this).css('margin-right'), 10)
        })
        if (width > maxWidth) maxWidth = width
    })
    $menu.css({width: maxWidth})
    return this
}

Submenu.prototype.navigate = function (direction) {
    return this.contents.navigate(direction)
}

Submenu.prototype.measure = function() {
    this.contents.measure()
    return this
}

Submenu.prototype.focus = function () {
    if (!this.$el.hasClass('focused')) {
        this.$el.addClass('focused')
        this.contents.show()
        this.publish('focus')
    }
    return this
}

Submenu.prototype.blur = function () {
    if (this.$el.hasClass('focused')) {
        this.$el.removeClass('focused')
        this.contents.hide()
        this.publish('blur')
    }
    return this
}

Submenu.prototype.remove = function() {
    this.contents.remove()
    this.$el.remove()
    return this
}