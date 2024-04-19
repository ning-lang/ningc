# Ning Playground

This is a playground for the Ning programming language.
It is still in the alpha phase, so many features are yet to be implemented. Check out the demo [**here**](https://ning-lang.github.io/playground)!

## Contents

- [About Ning](#about-ning)
- [Examples](#examples)
- [Language details](#language-details)
  - [Variables](#variables)
  - [List](#lists)
  - [Commands](#commands)
  - [Expressions](#expressions)
  - [Defining commands](#defining-commands)
  - [Defining queries](#defining-queries)
- [Roadmap](#roadmap)
  - [Done](#done)
  - [Todo](#todo)

## About Ning

Ning is a simple programming language inspired by [Scratch](https://scratch.mit.edu).
Note that Ning is not affiliated with Scratch or MIT in any way.
It is more or less what you might get when you convert Scratch to a text-based programming language,
replace the sprite/costume system with a render function,
and add static typechecking.

The easiest way to learn is to check out the [demo](https://ning-lang.github.io/playground).

## Examples

Several examples can be found in the [`examples`](/examples/) directory.
You can try pasting them into the editor in the [demo](https://ning-lang.github.io/playground) to see what they do.

## Language details

This is a boring overview of the language.
We do not recommend you read it.
Instead, we recommend that you check out the [demo](https://ning-lang.github.io/playground) and learn by playing around with the editor.

### Variables

Ning has three data types: booleans, numbers, and strings. All data types are immutable.

A boolean is `true` or `false`. A number is a floating point value. It is either a real number, `Infinity`, `-Infinity`, or `NaN`. Strings are currently implemented a JavaScript strings (usually UTF-16), but we may transition to some other format (e.g., UTF-8) in the future.

You can store data in variables:

```ning
Command (update) {
    var [foo] = (123);
    var [is awesome] = (true);
    var [name] = ("John Doe");

    if (true) {
        var [bar] = (42);
    };
}
```

All variables are block-scoped, except for those declared within a `Global`. You use `Global` to declare variables in the global scope:

```ning
Global {
    var [everyone can access me] = (123);
}

Command (update) {
    var [foo] = ((everyone can access me) + (5));
}
```

The `Global` section may only contain the variable declarations and list declarations--no other types of commands (e.g., painting commands) are allowed.

You can reassign variables with the `set [] to ()` command:

```ning
Command (update) {
    var [foo] = (123);
    set [foo] to (456);
}
```

If you replace `var` with `let`, the variable will become non-reassignable.

```ning
Command (update) {
    let [you can't touch this] = (123);

    // COMPILER ERROR: Cannot reassign `you can't touch this`
    set [you can't touch this] to (456);
}
```

### Lists

You can store homogeneous collections by using lists:

```ning
Command (update) {
    create string list [names];
    add ("Art") to [names];
    add ("Holly") to [names];
    add ("Rei") to [names];

    create number list [lucky numbers];
    add (7) to [lucky numbers];
    add (39) to [lucky numbers];

    create boolean list [foo];
    add (true) to [foo];
    add (false) to [foo];
}
```

Lists are not first-class data types. In other words, you cannot pass them around as values.
As previously stated, there are only three data types in Ning: booleans, numbers, and strings.

Lists are mutable.

### Commands

_Commands_ are analogous to what other programming languages call "statements".
For example, `var [my lucky number] = (42);` is a command.
A command has one or more _parts_ plus a semicolon.
A command part can be either...

- An identifier

  Identifiers can include any character except whitespace, capital letters (A-Z), or reserved punctuation (`(){}[];"`).

- A parenthesized expression
- A square bracket separated identifier sequence (simply called "square" for short)
- A block command

In the `var [my lucky number] = (42);` example, there are 4 parts:

1. The identifier `var`
2. The square `[my lucky number]`
3. The identifier `=`
4. The parenthesized expression `(42)`

In languages like JavaScript, C, and Python, a function call generally has the function name at the beginning, and then parenthesis-enclosed arguments at the end.
In contrast, Ning allows you to interweave the command's name and it's argument, slightly closer to a Swift-like syntax.

A commands identifiers determine the name, and the squares, parenthesized expressions, and block commands determine the arguments.
For example, the `var [my lucky number] = (42);` example is a call to the function of the signature `var [] = ()` with the square argument `my lucky number` and the value argument `42`.

### Expressions

An expression can either be a string literal (e.g., `"hello"`), a number literal (e.g., `-42.5e6`), or a non-literal expression.
A non-literal expression has one or more parts. A non-literal expression part can be either:

- An identifier
- A parenthesized expression
- A square

### Defining commands

```ning
Global {
    create number list [foo];
}

// Below is an example of a user-defined command:
Command (add (Number item) to foo 10 times) {
    repeat (10) times {
        add (item) to [foo];
    };
}
```

### Defining queries

```ning
Global {
    var [x] = (123);
}

// Below is an example of a user-defined query:
Number Query (sec of (Number theta) radians) {
    return ((1) / (cos of (theta) radians));
}

Command (update) {
    set [x] to (sec of (x) radians);
}
```

Query bodies may only contain the following types of commands:

- Variable declarations
- List declarations
- Local variable reassignments
- Local list mutations
- `repeat () times {}`
- `if () {}`
- `if () {} else {}`
- `return ()`

This rule exists so that queries will never have side effects.

## Roadmap

### Done

- Interpreter
- Static analyser
- Syntax highlighting
- Error underlining

### Todo

- Line numbers in the editor
- More descriptive error reporting

  Currently, there is only a red wavy underline--no
  actual description of the error.

- Image library display

  Currently, the user has no way of knowing
  what images are available to them.

- User image uploads

  Currently, the user can only use the default
  (stock) images, which are rather uninteresting.

- Support sound effects
- Lift restrictions on commands in `Global` section

  The signatures of commands in the `Global` body
  are currently
  restricted to a subset of those that are
  available in query definition bodies.
  There is no reason for this.
  The full set of commands available in query
  definition bodies should be available in
  the `Global` body.

- Fullscreen support
- Touchscreen support
- Editor minimap
- Project sharing
- Smart parenthesis and square bracket support in code editor
