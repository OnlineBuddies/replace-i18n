#!/usr/bin/env node
var esprima = require('esprima');
var escodegen = require('escodegen');
var util = require('util');
var csv = require('csv');
var fs = require('fs');
var optimist = require('optimist');
var eswalk = require('eswalk');

var argv = optimist
    .usage('Replace __("string") with translated string\n\nUsage: $0 -d data -l language file')
    .options('l', {
        "alias": 'language',
        "describe": 'The language to emit'
    })
    .options('d', {
        "alias": "data",
        "describe": "the data file of translations"
    })
    .options('h', {
        "alias": "help",
        "describe": "Show help"
    }).demand(['l', 'd']).argv;

if (argv.h || argv._.length > 1) {
    optimist.showHelp();
    process.exit();
}

if (argv._.length) {
    fs.readFile(argv._[0], 'utf-8', function(err, src) {
        var translations = {};
        if (err) throw(err);
        csv().from.path(argv.data, {delimiter: "\t", columns: true}).to.array(function (translations) {
            parse(keyify(translations), src, argv._[0]);
        }).on('error', function (err) {
            throw(err);
        });
    });
} else {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    var str = '';
    process.stdin.on('data', function (chunk) { str += chunk; });

    process.stdin.on('end', function () {
        parse(str);
    });
}

function keyify(translations) {
    var out = {};
    translations.forEach(function(e) {
        out[e.Tag] = {
            en: e.English,
            es: e.Spanish,
            it: e.Italian,
            pt: e.Portuguese,
            de: e.German,
            fr: e.French,
            zh: e['Simplified Chinese'],
            zh_TW: e['Traditional Chinese'],
            ja: e.Japanese
        };
    });
    return out;
}

function parse(translations, src, file) {
    var tree = esprima.parse(src, {loc: file ? { source: file } : true });

    eswalk(tree, function(node, parent, key) {
        if (node.type == 'CallExpression' &&
            node.callee.type == 'Identifier' &&
            node.callee.name == '__') {
            parent[key] = replaceI18N(node);
        }

    });

    function replaceI18N(node) {
        var key = node['arguments'][0].value;
        var translation = translations[key];
        return {
            'type': 'Literal',
            'value': (translation && translation[argv.l]) ? translation[argv.l] : node['arguments'][0].value
        };
    }

    console.log(escodegen.generate(tree));
}

