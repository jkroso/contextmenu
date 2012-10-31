var $ = require('jquery'),
    _ = require('underscore'),
    Tip = require('Tip'),
    Item = require('./item/index')

require('./menu.css').init()

module.exports = Menu

function Menu (target) {
    // Register the instance
    Menu.instances.push(this)
    // Events will be fired on this node
    this.targetNode = target
    this.classname = 'menu'
    this.content = document.createElement('div')
    this.$content = $(this.content).append(this.template()).addClass('menu')
    Tip.call(this, this.content)
    this.place('north east')
    this.items = []
}

Menu.instances = []
// Destroy all active menus
Menu.clear = function () {
    Menu.instances.forEach(function (menu) {
        menu.remove()
    })
    Menu.instances.length = 0
}
// Alternative constructor
Menu.new = function (target) {
    return new(this)(target)
}

// Inherit from Tip
Menu.prototype = Object.create(Tip.prototype, {constructor:{value:Menu}})

Menu.prototype.template = require('./menu.hbs')

Menu.prototype.newItem = function () {
    return new Item(this)
}

Menu.prototype.domEvents = {
    keydown : function (e) {
        // Stop scrolling
        e.preventDefault()
        switch (e.which) {
        case 40:
            this.down()
            break
        case 38:
            this.up()
            break
        case 37: // left
            this.transferFocus('left')
            break
        case 39: // right
            this.transferFocus('right')
            break
        case 13:
            this.toggleSelect(e)
            break
        }
    },
    mousedown : function (e) {
        if (!this.$el.hasClass('hasFocus')) this.focus()
        else this.toggleSelect()
        // Stop it from loosing focus
        e.preventDefault()
    },
    mousemove : function (e) {
        var target = e.target
        var self = this
        this.$content.children('.item').each(function () {
            if ($(this).is(target) || $(this).find(target).length) {
                // self.moveFocus(this)
                var item = _.find(self.items, function (item) {
                    return item.view === this
                }, this)
                var now = self.getFocused()
                if (item !== now) {
                    item.focus()
                    now && now.blur()
                }
            }
        })
    },
    mouseenter : function (e) {
        if (!this.$el.hasClass('hasFocus')) this.focus()
    },
    mouseleave : function (e) {
        this.items.forEach(function (item) {
            if (item.isFocused()) item.blur()
        })
        this.hideLens()
    },
    focusin : function (e) {
        this.$el.addClass('hasFocus')
        console.log('focus in')
    },
    focusout : function (e) {
        this.$el.removeClass('hasFocus')
        console.log('focus out')
    }
}

Menu.prototype.bind = function() {
    var evts = this.domEvents
    this.domEvents = {}
    for (var type in evts) {
        this.$el.on(type, this.domEvents[type] = evts[type].bind(this))
    }
    return this
}

Menu.prototype.unbind = function () {
    for (var type in this.domEvents) {
        this.$el.off(type, this.domEvents[type])
    }
    delete this.domEvents
    return this
}

Menu.prototype.up = function () {
    var now = this.getFocused()
    if (now && now instanceof Submenu) {
        if (now.getFocused()) {
            now.navigate('up')
            return this
        }
    }
    return this.navigate('up')
}

Menu.prototype.down = function () {
    var now = this.getFocused()
    if (now && now instanceof Submenu) {
        if (now.getFocused()) {
            now.navigate('down')
            return this
        }
    }
    return this.navigate('down')
}

Menu.prototype.transferFocus = function (direction) {
    var now = this.getFocused()
    if (now && now instanceof Submenu) {
        // The submenu has opened to the right
        if (now.$content.offset().left > now.$el.offset().left) {
            now[direction === 'right' ? 'open' : 'close'](direction)
        } else {
            now[direction === 'left' ? 'open' : 'close'](direction)
        }
    }
}

Menu.prototype.open = function (direction) {
    var now = this.getFocused()
    if (now && now instanceof Submenu) {
        now.open()
    }
}

Menu.prototype.close = function (direction) {
    var now = this.getFocused()
    if (now && now instanceof Submenu) {
        now.close()
    }
}

Menu.prototype.navigate = function (direction) {
    var now = this.getFocused(), next
    if (now) {
        next = this.items[this.items.indexOf(now) + (direction === 'up' ? -1 : 1)]
    } else {
        next = direction === 'up' ? this.items[this.items.length - 1] : this.items[0]
    }
    if (next) {
        next.focus()
        now && now.blur()
    }
    return this
}

Menu.prototype.toggleSelect = function() {
    var now = this.getFocused()
    if (now) now.toggleSelect()
    return this
}

Menu.prototype.getFocused = function () {
    return _.find(this.items, function (item) {
        return item.isFocused()
    })
}

// Must prevent the focus event causing the browser to scroll
Menu.prototype.focus = function () {
    var x = window.scrollX, y = window.scrollY
    this.$content.find('.key-bait').focus()
    window.scrollTo(x, y)
    return this
}

Menu.prototype.blur = function () {
    // this.$el.removeClass('hasFocus')
    this.$content.find('.key-bait').blur()
    // No need to actually blur the key-bait element
    return this
}

Menu.prototype.item = function(title, icon) {
    var item = this.newItem()
    if (typeof title === 'string') {
        item.title(title)
        if (icon) item.icon(icon)
    // Options object
    } else {
        item.title(title.title)
        if (title.icon) item.icon(title.icon)
    }
    return item.insert()
}

Menu.prototype.add = function (item) {
    this.items.push(item)
    item.on('focus', function () {
            this.moveLens(item)
        }, this)
        .on('blur', function () {
            if(!this.getFocused()) this.hideLens()
        }, this)
        .on('select', function () {
            $(this.targetNode).trigger(item
                .$el
                .find('.title')
                .text()
                .toLowerCase()
                .trim()
                .replace(/\s+/, '-'))
            this.remove()
        }, this)
    this.$content.append(item.view)
    return this
}

Menu.prototype.moveLens = function (item) {
    var target = item.view
    this.$content.children('.focus-lens').css({
        display: 'block',
        top: target.offsetTop,
        height: target.offsetHeight
    })
    return this
}

Menu.prototype.hideLens = function () {
    this.$content.find('.focus-lens').hide()
    return this
}

Menu.prototype.fixWidth = function (width) {
    if (!width) width = this.$content.css('width')
    this.$content.css('width', width)
    return this
}

Menu.prototype.submenu = function (title, icon) {
    var menu = new Submenu(this)
    if (title) menu.title(title)
    if (icon) menu.icon(icon)
    return menu
}

Menu.prototype.done = function (x, y) {
    if (x) this.target.apply(this, arguments)
    return this
        .fixWidth()
        .measure()
        .bind()
        .show()
        .focus()
}

Menu.prototype.removeOnBlur = function() {
    $(window).on('mousedown', function blur (e) {
        if (!e.isDefaultPrevented()) {
            this.remove()
            $(window).off('mousedown', blur)
        }
    }.bind(this))
    return this
}

Menu.prototype.remove = function() {
    Tip.prototype.remove.call(this)
    this.items.forEach(function (item) {
        item.remove()
    })
    return this
}

// This dependency is circular so need to allow Menu to fully initialize before requiring it
var Submenu = require('./submenu/index')