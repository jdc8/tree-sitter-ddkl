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
            $.array_reference_scalar_reference,
            $.array_reference_scalar,
            $.scalar_reference,
            $.identifier,
        ),

        name: $ => /[a-zA-Z0-9_:]+/,
        scalar_reference: $ => /\$[a-zA-Z0-9_:]+/,
        array_reference_scalar: $ => /\$[a-zA-Z0-9_:]+\([a-zA-Z0-9_:]*\)/,
        array_reference_scalar_reference: $ => /\$[a-zA-Z0-9_:]+\(\$[a-zA-Z0-9_:]*\)/,
        identifier: $ => /[^\s\;\n\$\"\{][^\s\;\n]*/,
    }
});
