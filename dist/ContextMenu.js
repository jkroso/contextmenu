// ContextMenu - v0.5.0 - 2012-11-01
// Copyright (c) 2012 Jakeb Rosoman; Licensed 

(function(){function require(p, context, parent){ context || (context = 0); var path = require.resolve(p, context), mod = require.modules[context][path]; if (!mod) throw new Error('failed to require "' + p + '" from ' + parent); if(mod.context) { context = mod.context; path = mod.main; mod = require.modules[context][mod.main]; if (!mod) throw new Error('failed to require "' + path + '" from ' + context); } if (!mod.exports) { mod.exports = {}; mod.call(mod.exports, mod, mod.exports, require.relative(path, context)); } return mod.exports;}require.modules = [{}];require.resolve = function(path, context){ var orig = path, reg = path + '.js', index = path + '/index.js'; return require.modules[context][reg] && reg || require.modules[context][index] && index || orig;};require.relative = function(relativeTo, context) { return function(p){ if ('.' != p.charAt(0)) return require(p, context, relativeTo); var path = relativeTo.split('/') , segs = p.split('/'); path.pop(); for (var i = 0; i < segs.length; i++) { var seg = segs[i]; if ('..' == seg) path.pop(); else if ('.' != seg) path.push(seg); } return require(path.join('/'), context, relativeTo); };};
require.modules[0] = { "/Dropbox/Development/Libraries/Emitter/src/index.js": function(module, exports, require){module.exports = Emitter

function Emitter (obj) {
    if ( !(this instanceof Emitter) ) return obj ? Emitter.mixin(obj) : new Emitter
}

var proto = Emitter.prototype

Emitter.new = function () {
    return new(this)
}

function resetCallbacks (obj) {
    // Should not be enumerable
    Object.defineProperty(obj, '_callbacks', {
        value : Object.create(null),
        writable : true,
        configurable : true
    })
}

Emitter.mixin = function (obj) {
    Object.keys(proto).forEach(function (key) {
        Object.defineProperty(obj, key, { 
            value: proto[key], 
            writable:true,
            configurable:true 
        })
    })
    return obj
}

proto.publish = function (topic, data) {
    var calls
    if ((calls = this._callbacks) && (calls = calls[topic])) {
        topic = calls.length
        while (topic--) {
            calls[topic].call(calls[--topic], data)
        }
    }
    return this
}

proto.on = function (topics, callback, context) {
    if (!this._callbacks) resetCallbacks(this)
    var calls = this._callbacks
    topics.split(/\s+/).forEach(function (topic) {
        // Push to the front of the array; Using concat to avoid mutating the old array
        calls[topic] = [context || this, callback].concat(calls[topic] || [])
    }, this)
    return this
}

proto.once = function (topics, callback, context) {
    topics.split(/\s+/).forEach(function (topic) {
        var self = this
        function on (data) {
            self.off(topic, on)
            callback.call(context, data)
        }
        this.on(topic, on, context)
    }, this)
    return this
}

proto.off = function (topics, callback) {
    var calls = this._callbacks
    if ( calls ) {
        if ( topics ) {
            if ( callback ) {
                topics.split(/\s+/).forEach(function (topic) {
                    var events = calls[topic]
                    if ( events ) {
                        events = events.slice()
                        var i = events.length
                        while (i--) {
                            if (events[i--] === callback) {
                                events.splice(i, 2)
                                calls[topic] = events
                                break
                            }
                        }
                    }                
                })
            } else {
                topics.split(/\s+/).forEach(function (topic) {
                    delete calls[topic]
                })
            }
        } else {
            resetCallbacks(this)
        }
    }
    return this
}},
"/Dropbox/Development/Libraries/Tip/src/index.js": function(module, exports, require){var Emitter = require('Emitter'),
    o = require('jquery'),
    tmpl = require('./tip.hbs')

require('./tip.css').init()

module.exports = Tip

/**
 * Apply the average use-case of simply
 * showing a tool-tip on `el` hover.
 *
 * Options:
 *
 *  - `delay` hide delay in milliseconds [0]
 *  - `value` defaulting to the element's title attribute
 *
 * @param {Mixed} el
 * @param {Object} options
 * @api public
 */

function tip(el, options) {
    options = options || {};
    var delay = options.delay;

    o(el).each(function(){
        var el = o(this)
        var val = options.value || el.attr('title')
        el.attr('title', '');
        new Tip(val)
            .cancelHideOnHover(delay)
            .attach(el[0], delay)
    })
}

/**
 * Initialize a `Tip` with the given `content`.
 *
 * @param {Mixed} content
 * @api public
 */

function Tip(content, options) {
    if (!(this instanceof Tip)) return tip(content, options)
    this.classname = 'tip'
    this.$el = o(tmpl())
    this.view = this.$el[0]
    this.$el
        .find('.tip-inner')
        .append(content)
    if (Tip.effect) this.effect(Tip.effect)
    this.appendTo(document.body)
        .place('north')
        .measure()
        .hide()
}

/**
 * Alternative constructor
 * @return {Tip}
 */
Tip.new = function (content, options) {
    return new(this)(content, options)
}

/**
 * Inherits from `Emitter.prototype`.
 */

var proto = Tip.prototype = Object.create(Emitter.prototype, {constructor:{value:Tip}})

/**
 * Attach to the given `el` with optional hide `delay`.
 *
 * @param {Element} el
 * @param {Number} delay
 * @return {Tip}
 * @api public
 */

proto.attach = function(el, delay){
    var self = this
    o(el).hover(function(){
        self.show();
        self.cancelHide();
    }, function(){
        self.hide(delay);
    });
    return this.target(el)
}

// proto.dettach = function () {}

proto.appendTo = function (el) {
    this.$el.appendTo(el)
    return this.sizeContainer()
}
// jquery's .offset() includes body margin which makes it incorrect in the context of positioning if the body is statically positioned
function offset (el) {
    var x = 0, y = 0
    do {
        x += el.offsetLeft + el.clientLeft
        y += el.offsetTop + el.clientTop
    } while (el = el.offsetParent)
    return {left: x, top: y}
}

proto.sizeContainer = function () {
    var parent = this.view.offsetParent
    var pos = offset(parent)
    // padding edge
    this._container = {
        left : pos.left,
        top : pos.top,
        right : pos.left + parent.clientWidth,
        bottom : pos.top + parent.clientHeight
    }
    return this
}

/**
 * Update the size properties for the tip element
 * 
 * @return {Tip}
 */

proto.measure = function () {
    var box = this.view.getBoundingClientRect()
    this.outerWidth = box.width
    this.outerHeight = box.height
    return this
}

/**
 * Cancel hide on hover, hide with the given `delay`.
 *
 * @param {Number} delay
 * @return {Tip}
 * @api public
 */

proto.cancelHideOnHover = function(delay){
    this.$el.hover(
        this.cancelHide.bind(this),
        this.hide.bind(this, delay))
    return this
}

/**
 * Set the effect to `type`.
 *
 * @param {String} type
 * @return {Tip}
 * @api public
 */

Tip.prototype.effect = function(type){
    this._effect = type
    this.$el.addClass(type)
    return this
}

/**
 * Set position `type`:
 *
 *  - `north`
 *  - `north east`
 *  - `north west`
 *  - `south`
 *  - `south east`
 *  - `south west`
 *  - `east`
 *  - `west`
 *
 * @param {String} type
 * @return {Tip}
 * @api public
 */

Tip.prototype.place = function(type){
    var types = (type).match(/(south|north)?\s*(east|west)?/)
    if (!types) throw new Error('Invalid position type')
    this._position = type
    this.setClass()
    this._vertical = types[1] || ''
    this._horizontal = types[2] || ''
    return this
}
Tip.prototype.position = Tip.prototype.place

/**
 * Calculate or set the target area
 * @param  {Object|Element} pos
 * @return {Tip}
 */

Tip.prototype.target = function (pos) {
    if (pos instanceof Element) {
        this._targetNode = pos
        pos = pos.getBoundingClientRect()
        var box = {
            top: pos.top + window.scrollY,
            left: pos.left + window.scrollX
        }
        box.right = box.left + pos.width
        box.bottom = box.top + pos.height
    } else {
        // Is an explicit cord
        delete this._targetNode
        if (arguments.length === 2) {
            var x = arguments[0], y = arguments[1]
            box = {
                left: x,
                right: x,
                top: y,
                bottom: y
            }
        }
    }
    box.midX = (box.left + box.right) / 2
    box.midY = (box.top + box.bottom) / 2
    this.targetBox = box
    return this
}

/**
 * Show the tip attached to `el`.
 *
 * Emits "show" (el) event.
 *
 * @param {jQuery|Element} el
 * @return {Tip}
 * @api public
 */

Tip.prototype.show = function () {
    this.$el.removeClass('tip-hide').css('visibility', 'visible')

    o(window)
        .on('resize', this._resize = function (e) {
            // Target node might of changed size
            if (this._targetNode) this.target(this._targetNode)
            // as might its container
            this.sizeContainer()
                .reposition()
        }.bind(this))
        .on('scroll', this._reposition = this.reposition.bind(this))

    // Call resize incase something changed while the tip was hidden
    this._resize()
    return this.publish('show')
}

/**
 * Apply the position. Recalculate if tip is off screen
 *
 * @api private
 */

Tip.prototype.reposition = function(){
    var pos = this._position
    var off = this.offset(pos)
    var sug = this.suggest(off)
    // If suggestions are made...
    if (sug.vert || sug.hor) {
        pos = ((sug.vert || this._vertical)+' '+(sug.hor || this._horizontal)).trim()
        //...recalculate with suggested position
        off = this.offset(pos)
    }
    // Default all properties to auto
    var css = {left:'auto', top:'auto', right:'auto', bottom: 'auto'}

    // Base positioning on the bottom edge so if content grows it positioning is still correct
    // if (this._vertical === 'north') css.bottom = document.body.offsetHeight - off.bottom
    css.top = off.top - this._container.top
    // Base positioning on the right edge so if content grows it positioning is still correct
    // if (this._horizontal === 'east') css.right = document.body.offsetWidth - off.right
    css.left = off.left - this._container.left

    // Ensure the correct position class is applied
    this.setClass(pos)
    this.$el.css(css)
    return this
}

/**
 * Compute the "suggested" position favouring `pos`.
 * Returns undefined if no suggestion is made.
 *
 * @param {Object} offset
 * @return {Object} .vert, .hor
 * @api private
 */

Tip.prototype.suggest = function(off){
    var win = o(window),
        top = win.scrollTop(),
        left = win.scrollLeft(),
        right = win.width() + left,
        bottom = win.height() + top,
        suggestion = {}
    // too high or too low
    if (off.top < top || off.bottom > bottom) {
        // more room above or bellow the target box
        if (bottom - this.targetBox.bottom > this.targetBox.top - top)
            suggestion.vert = 'south'
        else 
            suggestion.vert = 'north'
    }
    // too far to the right or left
    if (off.right > right || off.left < left) {
        // more room to the right or left of the target box
        if (right - this.targetBox.right > this.targetBox.left - left)
            suggestion.hor = 'east'
        else
            suggestion.hor = 'west'
    }
    return suggestion
}

/**
 * Replace position class
 *
 * @param {String} pos
 * @api private
 */

Tip.prototype.setClass = function(pos) {
    var c = 'tip-'+(pos || this._position).split(' ').join('-')
    if (c !== this._pos_class) {
        this.$el
            // FYI removeClass(undefined) removes everything
            .removeClass(this._pos_class || c)
            .addClass(this._pos_class = c)
    }
    return this
}

/**
 * Compute the screen location to render the tip
 * based on the given `pos`.
 *
 * @param {String} pos
 * @return {Object}
 * @api private
 */

Tip.prototype.offset = function(pos){
    var target = this.targetBox
    switch (pos) {
    case 'north':
        return {
            top: target.top - this.outerHeight,
            right: target.midX + this.outerWidth / 2,
            bottom: target.top,
            left: target.midX - this.outerWidth / 2
        }
    case 'north west':
        return {
            top: target.top,
            right: target.left,
            bottom: target.top + this.outerHeight,
            left: target.left - this.outerWidth
        }
    case 'north east':
        return {
            top: target.top,
            right: target.right + this.outerWidth,
            bottom: target.top + this.outerHeight,
            left: target.right
        }
    case 'south':
        return {
            top: target.bottom,
            right: target.midX + this.outerWidth / 2,
            bottom: target.bottom + this.outerHeight,
            left: target.midX - this.outerWidth / 2
        }
    case 'south west':
        return {
            top: target.bottom - this.outerHeight,
            right: target.left,
            bottom: target.bottom,
            left: target.left - this.outerWidth
        }
    case 'south east':
        return {
            top: target.bottom - this.outerHeight,
            right: target.right + this.outerWidth,
            bottom: target.bottom,
            left: target.right
        }
    case 'east':
        return {
            top: target.midY - this.outerHeight / 2,
            right: target.right + this.outerWidth,
            bottom: target.midY + this.outerHeight / 2,
            left: target.right
        }
    case 'west':
        return {
            top: target.midY - this.outerHeight / 2,
            right: target.left,
            bottom: target.midY + this.outerHeight / 2,
            left: target.left - this.outerWidth
        }
    default:
        throw new Error('invalid position "' + pos + '"');
    }
};

/**
 * Cancel the `.hide()` timeout.
 *
 * @api private
 */

Tip.prototype.cancelHide = function (){
    this.$el.removeClass('tip-hide')
    clearTimeout(this._hide)
    return this
}

/**
 * Hide the tip with optional `ms` delay.
 *
 * Emits "hide" event.
 *
 * @param {Number} ms
 * @return {Tip}
 * @api public
 */

Tip.prototype.hide = function (ms){
    this.$el.addClass('tip-hide')
    // duration
    if (ms) {
        this._hide = setTimeout(this.hide.bind(this), ms)
    } else {
        this.$el.css('visibility', 'hidden')
        o(window)
            .off('resize', this._resize || this.reposition)
            .off('scroll', this._reposition || this.reposition)
        this.publish('hide')
    }
    return this
}

/**
 * Hide then destroy
 *
 * @return {Tip}
 * @api
 */

Tip.prototype.remove = function(ms){
    this.hide(ms).$el.remove()
    return this
}},
"/Dropbox/Development/Libraries/Tip/src/tip.css": function(module, exports, require){
exports.init = function () {
  if (!style.parentElement) document.getElementsByTagName('head')[0].appendChild(style)
}
var style = document.createElement('style');
style.appendChild(document.createTextNode(".tip {\n  font-size: 11px;\n  position: absolute;\n  padding: 5px;\n  z-index: 1000;\n}\n\n.tip-inner {\n  background: rgb(50,50,50);\n  color: #fff;\n  padding: 5px;\n  display: inline-block;\n  border-radius: 3px;\n}\n\n.tip-arrow {\n  position: absolute;\n  width: 0;\n  height: 0;\n  line-height: 0;\n  border: 5px solid rgb(50,50,50);\n}\n  \n.tip-arrow-south { border-bottom-color: rgba(0,0,0,.75) }\n.tip-arrow-north { border-top-color: rgba(0,0,0,.75) }\n.tip-arrow-west { border-left-color: rgba(0,0,0,.75) }\n.tip-arrow-east { border-right-color: rgba(0,0,0,.75) }\n  \n.tip-south .tip-arrow {\n  top: 0px;\n  left: 50%;\n  margin-left: -5px;\n  border-bottom-style: solid;\n  border-top: none;\n  border-left-color: transparent;\n  border-right-color: transparent\n}\n\n.tip-north .tip-arrow {\n  bottom: 0;\n  left: 50%;\n  margin-left: -5px;\n  border-top-style: solid;\n  border-bottom: none;\n  border-left-color: transparent;\n  border-right-color: transparent\n}\n\n.tip-west .tip-arrow,\n.tip-north-west .tip-arrow,\n.tip-south-west .tip-arrow {\n  right: 0;\n  top: 50%;\n  margin-top: -5px;\n  border-left-style: solid;\n  border-right: none;\n  border-top-color: transparent;\n  border-bottom-color: transparent\n}\n\n.tip-east .tip-arrow,\n.tip-north-east .tip-arrow,\n.tip-south-east .tip-arrow {\n  left: 0;\n  top: 50%;\n  margin-top: -3px;\n  border-right-style: solid;\n  border-left: none;\n  border-top-color: transparent;\n  border-bottom-color: transparent\n}\n\n.tip-north-west .tip-arrow,\n.tip-north-east .tip-arrow {\n  margin-top: -1px;\n  top: 25%;\n}\n\n.tip-south-west .tip-arrow,\n.tip-south-east .tip-arrow {\n  top: 75%;\n  margin-top: -10px;\n}\n\n/* effects */\n\n.tip.fade {\n  transition: opacity 100ms;\n  -moz-transition: opacity 100ms;\n  -webkit-transition: opacity 100ms;\n}\n\n.tip-hide {\n  opacity: 0;\n}"))},
"/Dropbox/Development/Libraries/Tip/src/tip.hbs": function(module, exports, require){var Handlebars = require('Handlebars')
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
helpers || (helpers = Handlebars.helpers);
return "<div class=\"tip tip-hide\">\n  <div class=\"tip-arrow\"></div>\n  <div class=\"tip-inner\"></div>\n</div>";})},
"Emitter": function(module, exports, require){module.exports = require("/Dropbox/Development/Libraries/Emitter/src/index")}
,
"Handlebars": { exports: window.Handlebars },
"Tip": function(module, exports, require){module.exports = require("/Dropbox/Development/Libraries/Tip/src/index")}
,
"jquery": { exports: window.$ },
"src/index.js": function(module, exports, require){var $ = require('jquery'),
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
var Submenu = require('./submenu/index')},
"src/item/index.js": function(module, exports, require){module.exports = Item

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
},
"src/item/item.css": function(module, exports, require){
exports.init = function () {
  if (!style.parentElement) document.getElementsByTagName('head')[0].appendChild(style)
}
var style = document.createElement('style');
style.appendChild(document.createTextNode(".menu .item {\n	list-style: none;\n	position: relative;\n	padding: 8px 20px;\n	vertical-align: middle;\n	border-top-width:1px;\n	border-top-style: solid;\n	border-color: rgba(0,0,0,.1);\n}\n.menu .item:first-of-type {\n	border-top-right-radius: 3px;\n	border-top-left-radius: 3px;\n	border-top: none;\n}\n.menu .item:last-of-type {\n	border-bottom-right-radius: 3px;\n	border-bottom-left-radius: 3px;\n}\n.menu .item .icon {\n	display: inline-block;\n	margin-right: 10px;\n}\n.menu .item .icon img {\n	height: 14px;\n	width: 14px;\n}\n.menu .item .title {\n	display: inline-block;\n}\n.menu .item.selected {\n	background: #4297FF;\n  	background: -webkit-linear-gradient(top, #6FAFFF, #4297FF);\n}"))},
"src/item/item.hbs": function(module, exports, require){var Handlebars = require('Handlebars')
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
helpers || (helpers = Handlebars.helpers);
var buffer = "";


  buffer += "<div class=\"icon\"></div><div class=\"title\"></div>";
  return buffer;})},
"src/menu.css": function(module, exports, require){
exports.init = function () {
  if (!style.parentElement) document.getElementsByTagName('head')[0].appendChild(style)
}
var style = document.createElement('style');
style.appendChild(document.createTextNode(".menu {\n    -webkit-user-select:none;\n    background: white;\n    color:rgb(60,60,60);\n    font-size: 14px;\n    font-family: Verdana;\n    border:1px solid rgba(0,0,0,.4);\n    border-radius: 3px;\n    position: relative;\n}\ndiv.tip .tip-inner {\n    background: rgb(50,50,50);\n    color: #fff;\n    padding: 0;\n    display: inline-block;\n}\n.menu .focus-lens {\n    position: absolute;\n    left:0;\n    right:0;\n    background: #D9EAFF;\n    background: -webkit-linear-gradient(top, #D2E7FF, #9BC8FF);\n    transition: top 60ms ease-in;\n    -webkit-transition: top 100ms ease-out;\n}\ndiv.tip {\n    padding: 0;\n    box-shadow: -2px 2px 10px 0 rgba(0,0,0,.1);\n    -webkit-user-select:none;\n}\ndiv.tip .tip-arrow {\n    display: none;\n}"))},
"src/menu.hbs": function(module, exports, require){var Handlebars = require('Handlebars')
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
helpers || (helpers = Handlebars.helpers);
var buffer = "";


  buffer += "\r\n<div class=\"focus-lens\"></div>\r\n<input class=\"key-bait\" style=\"position:absolute;top:-9999px;\"></input>";
  return buffer;})},
"src/submenu/index.js": function(module, exports, require){var Menu = require('../index'),
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
}},
"src/submenu/submenu.hbs": function(module, exports, require){var Handlebars = require('Handlebars')
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
helpers || (helpers = Handlebars.helpers);
return "<div class=\"icon\"></div>\r\n<div class=\"title\"></div>";})},
"underscore": function(module, exports, require){module.exports = require("./vendor/underscore.js")}
,
"vendor/underscore.js": function(module, exports, require){//     Underscore.js 1.4.2
//     http://underscorejs.org
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.4.2';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return arguments.length > 2 ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // with specific `key:value` pairs.
  _.where = function(obj, attrs) {
    if (_.isEmpty(attrs)) return [];
    return _.filter(obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (obj.length === +obj.length) return slice.call(obj);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(concat.apply(ArrayProto, arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) {
          result = func.apply(context, args);
        }
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        throttling = true;
        result = func.apply(context, args);
      }
      whenDone();
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + (0 | Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });
      source +=
        escape ? "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'" :
        interpolate ? "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'" :
        evaluate ? "';\n" + evaluate + "\n__p+='" : '';
      index = offset + match.length;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);
}};
ContextMenu = require('src/index');
}());