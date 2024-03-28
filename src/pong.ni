Global {
    let [width] = (480);
    let [height] = (360);
    let [paddle width] = (20);
    let [paddle height] = ((height) / (5));
    let [paddle margin] = (paddle width);
    let [ball width] = (paddle width);
    let [ball height] = (ball width);
    let [ball speed magnitude] = ((ball width) * (3));

    var [left paddle top] = (((height) / (2)) - ((paddle height) / (2)));
    var [right paddle top] = (((height) / (2)) - ((paddle height) / (2)));
    var [ball left] = (((width) / (2)) - ((ball width) / (2)));
    var [ball top] = (((height) / (2)) - ((ball height) / (2)));
    var [x speed] = (0);
    var [y speed] = (0);
    var [left score] = (0);
    var [right score] = (0);

    var [w down] = (false);
    var [s down] = (false);
    var [up down] = (false);
    var [down down] = (false);

    var [last time] = (0);
}

Command (render) {
    resize canvas to width (width) height (height);
    draw image ('background.png') at x (0) y (0) with width (width) height (height);
    draw image ('left_paddle.png') at x (paddle margin) y (left paddle top) with width (paddle width) height (paddle height);
    draw image ('right_paddle.png') at x (width - paddle margin - paddle width) y (right paddle top) with width (paddle width) height (paddle height);
    draw image ('ball.png') at x (ball left) y (ball top) with width (ball width) height (ball height);
}

Command (update) {
    let [current time] = (milliseconds since unix epoch);
    if ((last time) = (0)) {
        set [last time] to (current time);
        reset ball and paddles;
        return;
    };
    let [elapsed time in seconds] = (((current time) - (last time)) / (1000));
    set [last time] to (current time);

    let [w was down] = (w down);
    let [s was down] = (s down);
    let [up was down] = (up down);
    let [down was down] = (down down);

    set [w down] to (is key down ('w'));
    set [s down] to (is key down ('s'));
    set [up down] to (is key down ('up'));
    set [down down] to (is key down ('down'));

    var [left dy] = (0);

    if ((w down) and (not (w was down))) {
        set [left dy] to ((-1) * (paddle height));
    };
    if ((s down) and (not (s was down))) {
        set [left dy] to (paddle height);
    };

    var [right dy] = (0);

    if ((up down) and (not (up was down))) {
        set [right dy] to ((-1) * (paddle height));
    };
    if ((down down) and (not (down was down))) {
        set [right dy] to (paddle height);
    };

    change [left paddle top] by (left dy);
    change [right paddle top] by (right dy);

    let [ball dx] = ((x speed) * (elapsed time in seconds));
    let [ball dy] = ((y speed) * (elapsed time in seconds));

    change [ball left] by (ball dx);
    change [ball top] by (ball dy);

    if ball is out of bounds, update score and reset ball;
    if ball is colliding with paddle, bounce;
    if ball is colliding with top or bottom wall, bounce;
}

Command (reset ball and paddles) {
    set [left paddle top] to (((height) / (2)) - ((paddle height) / (2)));
    set [right paddle top] to (((height) / (2)) - ((paddle height) / (2)));
}

Command (reset ball) {
    set [ball left] to (((width) / (2)) - ((ball width) / (2)));
    set [ball top] to (((height) / (2)) - ((ball height) / (2)));
    let [angle] = (pick random from (0) up to but not including (360))
    set [x speed] to ((cosine of (angle) degrees) * (ball speed magnitude));
    set [y speed] to ((sine of (angle) degrees) * (ball speed magnitude));
}

Command (if ball is out of bounds, update score and reset ball) {
    let [ball right] = ((ball left) + (ball width));
    if ((ball right) < (0)) {
        change [right score] by (1);
        reset ball;
        return;
    };
    if ((ball left) > (width)) {
        change [left score] by (1);
        reset ball;
        return;
    };
}

Command (if ball is colliding with paddle, bounce) {
    if ((ball is touching left paddle?) or (ball is touching right paddle?)) {
        set [x speed] to ((-1) * (x speed));
    };
}

Boolean Query (ball is touching left paddle?) {
    let [ball right] = ((ball left) + (ball width));
    let [ball bottom] = ((ball top) + (ball height));

    let [paddle left] = (paddle margin);
    let [paddle right] = ((paddle margin) + (paddle width));
    let [paddle top] = (left paddle top);
    let [paddle bottom] = ((left paddle top) + (paddle height));

    let [in horizontal bounds?] = (((ball left) <= (paddle right)) and ((ball right) >= (paddle left)))
    let [in vertical bounds?] = (((ball top) <= (paddle bottom)) and ((ball bottom) >= (paddle top)))
    return ((in horizontal bounds?) and (in vertical bounds?));
}

Boolean Query (ball is touching right paddle?) {
    let [ball right] = ((ball left) + (ball width));
    let [ball bottom] = ((ball top) + (ball height));

    let [paddle right] = ((width) - (paddle margin));
    let [paddle left] = ((paddle right) - (paddle width));
    let [paddle top] = (right paddle top);
    let [paddle bottom] = ((right paddle top) + (paddle height));

    let [in horizontal bounds?] = (((ball left) <= (paddle right)) and ((ball right) >= (paddle left)))
    let [in vertical bounds?] = (((ball top) <= (paddle bottom)) and ((ball bottom) >= (paddle top)))
    return ((in horizontal bounds?) and (in vertical bounds?));
}

Command (if ball is colliding with top or bottom wall, bounce) {
    let [ball bottom] = ((ball top) + (ball height));
    let [is touching top wall?] = ((ball top) <= (0));
    let [is touching bottom wall?] = ((ball bottom) >= (height));
    if ((is touching top wall?) or (is touching bottom wall?)) {
        set [y speed] to ((-1) * (y speed));
    };
}

// Difference between commands and queries:
// - Commands have side effects, but do not return a value.
//   Commands may not terminate.
// - Queries return a value, and have no side effects.
//   Queries always terminate.
//   However, queries may not be "pure" in the sense that they
//   may return different outputs for the same inputs.
//   You can only use a limited subset of commands within a query:
//   * `let` and `var`
//   * `create <number|string|boolean> list`
//   * LOCAL variable and list mutation, excluding parameters.
//     You CANNOT mutate parameters.
//   * `repeat #() times` (the finite version)
//   * `if` and `else`
//   * `return`
//   Queries have the additional following restrictions:
//   * Queries cannot circularly depend on each other.
//   * Queries must have a return statement covering the end of
//     every possible branch.



// Difference between `()` and `[]`:
// - `()` are used for immutable values
// - `[]` are used for mutable references
//   * List parameters must always be `[]`,
//     since Ning does not copy lists when passing them to functions.
