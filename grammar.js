// Tcl parser based on Tcl Dodecalogue at https://www.tcl.tk/man/tcl8.6/TclCmd/Tcl.htm
// with ideas from https://github.com/tree-sitter-grammars/tree-sitter-tcl

module.exports = grammar({

    name: 'ddkl',

    rules: {

        source_file: $ => repeat(seq($.command, choice(';', '\n'))),

        command: $ => choice(seq($.command_name, optional($.command_arguments))),

        command_name: $ => $.word,
        command_arguments: $ => repeat1($.command_argument),
        command_argument: $=> $.word,

        word: $ => choice(
            $.identifier,
        ),

        identifier: $ => /[^\s\;\n]+/,
    }
});
