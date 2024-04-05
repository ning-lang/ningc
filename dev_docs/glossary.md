# Glossary of terms used internally by the Ning interpreter

## input

Every function application has zero or more inputs.
An input is either (1) an _argument_, (2) a _square_, or (3) a _block command_.

## signature

Every function definition and function application has a signature.
A signature is a string.
A signature describes the labels and inputs.

Examples:

1.  Function application:

    ```ning
    draw image ("shiba.png") at x (50) y (20) with width (200) and height (200);
    ```

    Function signature:

    ```ning
    draw image () at x () y () with width () and height ()
    ```

    Note that the signature does _not_ distinguish between arguments of different types--they are all represented by `()`.

2.  Function application:

    ```ning
    if (true) {
        // ...
    } else {
        // ...
    };
    ```

    Function signature:

    ```ning
    if () {} else {}
    ```

3.  Function application:

    ```ning
    set [foo] to ("hi");
    ```

    Function signature:

    ```ning
    set [] to ()
    ```

As you can see, parameters/arguments are represented by `()`, squares are represented by `[]`, and block commands are represented by `{}`.

Observe that a signature does not contain parameter type or return type information.

## square

"Square" is shorthand for "square bracket enclosed identifier sequence".
Squares represent l-values (assignable expressions).
In contrast, r-values are enclosed in parentheses.

For example, in `set [foo] = (9);`, `foo` is an l-value, so it's written with square brackets (i.e., `[foo]`), and `9` is an r-value, so it's written with parentheses (i.e., `(9)`).

As a corollary, squares always refer to a variable or a list (since those are the only types of l-value).

Squares have 6 types:

1. boolean
2. number
3. string
4. boolean list
5. number list
6. string list
