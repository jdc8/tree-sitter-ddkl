// Tcl parser base on Tcl Dodecalogue with ideas from https://github.com/tree-sitter-grammars/tree-sitter-tcl

const PRECEDENCES = {
    unary        : 150,
    exponent     : 140,
    multdivmod   : 130,
    addsub       : 120,
    shift        : 110,
    compare      : 100,
    equal_bool   : 90,
    equal_string : 80,
    contains     : 70,
    bitwise_and  : 60,
    bitwise_xor  : 50,
    bitwise_or   : 40,
    logical_and  : 30,
    logical_or   : 20,
    ternary      : 10,
}

module.exports = grammar({
  name: 'ddkl',

  rules: {

      source_file: $ => repeat(
          choice (
              seq($.command, ';'),
              seq($.command, '\n'),
          ),
      ),

      // general Tcl commands
      command: $ => choice (
          seq($.command_name, optional($.command_arguments)),
          $.expr_command,
          $.for_command,
          $.if_command,
          $.proc_command,
          $.while_command,
      ),
      command_name: $ => $._word,
      command_arguments: $ => repeat1($._word),

      bracketed_command: $ => seq('\[', $.command, repeat(seq(choice (';', '\n'), $.command)), optional('\n'), '\]'),

      _body_commands: $ => choice (
          $._word_no_braced_identifier,
          seq('{', '}'),
          seq('{', $.command, repeat(seq(choice (';', '\n'), $.command)), optional('\n'), '}'),
      ),

      // expressions
      unary_operator_minus     : $ => '-',
      unary_operator_plus      : $ => '+',
      unary_operator_complement: $ => '~',
      unary_operator_not       : $ => '!',

      unary_expression: $ => choice(
          prec.left(PRECEDENCES.unary , seq($.unary_operator_minus      , $._sub_expression)),
          prec.left(PRECEDENCES.unary , seq($.unary_operator_plus       , $._sub_expression)),
          prec.left(PRECEDENCES.unary , seq($.unary_operator_complement , $._sub_expression)),
          prec.left(PRECEDENCES.unary , seq($.unary_operator_not        , $._sub_expression)),
      ),

      binary_operator_exponent       : $ => '**',
      binary_operator_mult           : $ => '*',
      binary_operator_div            : $ => '/',
      binary_operator_mod            : $ => '%',
      binary_operator_add            : $ => '+',
      binary_operator_sub            : $ => '-',
      binary_operator_shift_left     : $ => '<<',
      binary_operator_shift_right    : $ => '>>',
      binary_operator_compare_lt     : $ => '\<',
      binary_operator_compare_le     : $ => '\<=',
      binary_operator_compare_ge     : $ => '>=',
      binary_operator_compare_gt     : $ => '>',
      binary_operator_equal_bool_eq  : $ => '==',
      binary_operator_equal_bool_ne  : $ => '!=',
      binary_operator_equal_string_eq: $ => 'eq',
      binary_operator_equal_string_ne: $ => 'ne',
      binary_operator_contains_in    : $ => 'in',
      binary_operator_contains_ni    : $ => 'ni',
      binary_operator_bitwise_and    : $ => '&',
      binary_operator_bitwise_xor    : $ => '^',
      binary_operator_bitwise_or     : $ => '|',
      binary_operator_logical_and    : $ => '&&',
      binary_operator_logical_or     : $ => '||',

      binary_expression: $ => choice(
          prec.left(PRECEDENCES.exponent     , seq($._sub_expression, $.binary_operator_exponent        , $._sub_expression)),
          prec.left(PRECEDENCES.multdivmod   , seq($._sub_expression, $.binary_operator_mult            , $._sub_expression)),
          prec.left(PRECEDENCES.multdivmod   , seq($._sub_expression, $.binary_operator_div             , $._sub_expression)),
          prec.left(PRECEDENCES.multdivmod   , seq($._sub_expression, $.binary_operator_mod             , $._sub_expression)),
          prec.left(PRECEDENCES.addsub       , seq($._sub_expression, $.binary_operator_add             , $._sub_expression)),
          prec.left(PRECEDENCES.addsub       , seq($._sub_expression, $.binary_operator_sub             , $._sub_expression)),
          prec.left(PRECEDENCES.shift        , seq($._sub_expression, $.binary_operator_shift_left      , $._sub_expression)),
          prec.left(PRECEDENCES.shift        , seq($._sub_expression, $.binary_operator_shift_right     , $._sub_expression)),
          prec.left(PRECEDENCES.compare      , seq($._sub_expression, $.binary_operator_compare_lt      , $._sub_expression)),
          prec.left(PRECEDENCES.compare      , seq($._sub_expression, $.binary_operator_compare_le      , $._sub_expression)),
          prec.left(PRECEDENCES.compare      , seq($._sub_expression, $.binary_operator_compare_ge      , $._sub_expression)),
          prec.left(PRECEDENCES.compare      , seq($._sub_expression, $.binary_operator_compare_gt      , $._sub_expression)),
          prec.left(PRECEDENCES.equal_bool   , seq($._sub_expression, $.binary_operator_equal_bool_eq   , $._sub_expression)),
          prec.left(PRECEDENCES.equal_bool   , seq($._sub_expression, $.binary_operator_equal_bool_ne   , $._sub_expression)),
          prec.left(PRECEDENCES.equal_string , seq($._sub_expression, $.binary_operator_equal_string_eq , $._sub_expression)),
          prec.left(PRECEDENCES.equal_string , seq($._sub_expression, $.binary_operator_equal_string_ne , $._sub_expression)),
          prec.left(PRECEDENCES.contains     , seq($._sub_expression, $.binary_operator_contains_in     , $._sub_expression)),
          prec.left(PRECEDENCES.contains     , seq($._sub_expression, $.binary_operator_contains_ni     , $._sub_expression)),
          prec.left(PRECEDENCES.bitwise_and  , seq($._sub_expression, $.binary_operator_bitwise_and     , $._sub_expression)),
          prec.left(PRECEDENCES.bitwise_xor  , seq($._sub_expression, $.binary_operator_bitwise_xor     , $._sub_expression)),
          prec.left(PRECEDENCES.bitwise_or   , seq($._sub_expression, $.binary_operator_bitwise_or      , $._sub_expression)),
          prec.left(PRECEDENCES.logical_and  , seq($._sub_expression, $.binary_operator_logical_and     , $._sub_expression)),
          prec.left(PRECEDENCES.logical_or   , seq($._sub_expression, $.binary_operator_logical_or      , $._sub_expression)),
      ),

      ternary_expression: $ => prec.left(PRECEDENCES.ternary, seq($._sub_expression, '?', $._sub_expression, ':', $._sub_expression)),

      _sub_expression: $ => choice (
          seq('(', $._sub_expression, ')'),
          $.unary_expression,
          $.binary_expression,
          $._word_no_braced_identifier,
      ),

      expression: $ => choice (
          $._sub_expression,
          seq('{', '}'),
          seq('{', $._sub_expression, '}'),
      ),

      // specific Tcl command where we know how to parse the arguments

      // expr command
      expr_command: $ => seq('expr', $.expression),

      // for command
      for_command: $ => seq('for', $.for_start, $.for_test, $.for_next, $.for_body),
      for_start: $ => $._body_commands,
      for_test: $ => choice (
          $._word_no_braced_identifier,
          seq('{', '}'),
          seq('{', $.expression, '}'),
      ),
      for_next: $ => $._body_commands,
      for_body: $ => $._body_commands,

      // if command
      if_command: $ => seq('if', $.if_expression, optional('then'), $.if_body, repeat(seq('elseif', $.elseif_expression, optional('then'), $.elseif_body)), optional(seq('else', $.else_body))),
      if_expression: $ => choice (
          $._word_no_braced_identifier,
          seq('{', '}'),
          seq('{', $.expression, '}'),
      ),
      elseif_expression: $ => choice (
          $._word_no_braced_identifier,
          seq('{', '}'),
          seq('{', $.expression, '}'),
      ),
      if_body: $ => $._body_commands,
      elseif_body: $ => $._body_commands,
      else_body: $ => $._body_commands,

      // proc command
      proc_command: $ => seq('proc', $.proc_name, $.proc_arguments, $.proc_body),
      proc_name: $ => $._word,
      proc_arguments: $ => choice (
          $._word_no_braced_identifier,
          seq('{', repeat($._word), '}'),
      ),
      proc_body: $ => $._body_commands,

      // while command
      while_command: $ => seq('while', $.while_test, $.while_body),
      while_test: $ => choice (
          $._word_no_braced_identifier,
          seq('{', '}'),
          seq('{', $.expression, '}'),
      ),
      while_body: $ => $._body_commands,

      // words
      _word_no_braced_identifier: $ => choice (
          $.identifier,
          $.array_identifier,
          $.scalar_dereference,
          $.array_dereference,
          $.braced_dereference,
          $.bracketed_command,
     ),

      _word: $ => choice (
          $._word_no_braced_identifier,
          $.braced_identifier,
      ),

      // identifiers
      identifier: $ => /[a-zA-Z0-9_:]+/,

      array_identifier: $ => choice(
          seq($.identifier, '(', $.identifier, ')'),
          seq($.identifier, '(', $.scalar_dereference, ')'),
          seq($.identifier, '(', $.bracketed_command, '\)'),
      ),

      braced_identifier: $ => /\{[^\}]*\}/,

      // dereferences
      scalar_dereference: $ => seq('$', $.identifier),

      array_dereference: $ => choice(
          seq('$', $.identifier, '(', $.identifier, ')'),
          seq('$', $.identifier, '(', $.scalar_dereference, ')'),
          seq('$', $.identifier, '(', $.bracketed_command, '\)'),
      ),

      braced_dereference: $ => seq('$', '\{', $.identifier, '\}'),
  }
});
