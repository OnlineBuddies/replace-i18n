replace-i18n
============

Replaces calls to a function `__` with replacements from a dictionary.

An example. Given a `test.js` like so:

    console.log(__("HELLOWORLDKEY"));

And a `dictionary.tsv` like so:

    "Key"	"English"
    "HELLOWORLDKEY"	"Hello, World"

Running `replace-i18n.js -l en -d dictionary.tsv < test.js > test.en.js` gives an output file like so:

    console.log("Hello, World");
