var fs = require('fs'),
    Glue = require('gluejs'),
    Handlebars = require('handlebars');

new Glue()
    .include('src/')
    .include('vendor/')
    .include('/Dropbox/Development/Libraries/Emitter/src/')
    .include('/Dropbox/Development/Libraries/Tip/src/')
    .replace({
        'jquery': 'window.$',
        'Handlebars': 'window.Handlebars'
    })
    .define('underscore', 'module.exports = require("./vendor/underscore.js")')
    .define('Emitter', 'module.exports = require("/Dropbox/Development/Libraries/Emitter/src/index")')
    .define('Tip', 'module.exports = require("/Dropbox/Development/Libraries/Tip/src/index")')
    .handler(/\w+\.css$/, function (opts, done) {
        var out = 
            '\nexports.init = function () {\n'
            + '  if (!style.parentElement) document.getElementsByTagName(\'head\')[0].appendChild(style)\n'
            + '}\n'
            + 'var style = document.createElement(\'style\');\n'
            + 'style.appendChild(document.createTextNode("'
            + fs.readFileSync(opts.filename).toString().replace(/(\r\n|\r|\n)/g, '\\n') // make it a single line string
            +'"))'
        done(opts.filename, out)
    })
    // Precompiles Handlebars templates look like failing functions but they get run through Handlebars.template at run time 
    .handler(/\w+\.hbs$/, function(opts, done) {
        var out = 'var Handlebars = require(\'Handlebars\')'
            + '\nmodule.exports = Handlebars.template(' 
            + Handlebars.precompile(fs.readFileSync(opts.filename, 'utf-8')).toString()
            + ')'
        out = out.replace(
            /\s*helpers = helpers \|\| Handlebars\.helpers;\s*/,
            '\nhelpers || (helpers = Handlebars.helpers);\n'
        )
        done(opts.filename, out);
    })
    .set('debug', false)
    .main('src/index')
    .export('ContextMenu')
    .watch(function (err, txt) {
        fs.mkdir('dist', function (err) {
            fs.writeFile('dist/ContextMenu.js', txt);
        })
    });