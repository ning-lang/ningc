Global {
    create number list [height factors];
    add (1) to [height factors];
    add (1.5) to [height factors];
    add (0.5) to [height factors];
    let [height factor index] = (random integer from (0) up to but not including (length of [height factors]));
    let [height factor] = (item (height factor index) of [height factors]);
    let [width] = (480);
    // let [height] = ((360) + (length of [height factors]));
    let [height] = ((360) * (height factor));
    let [paddle width] = (20);
    let [paddle height] = ((height) / (5));
    let [paddle margin] = (paddle width);
    let [ball width] = (paddle width);
    let [ball height] = (ball width);
    let [ball speed magnitude] = ((ball width) * (30));

    let [min paddle y] = (0);
    let [max paddle y] = ((height) - (paddle height));

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
    var [i down] = (false);
    var [k down] = (false);

    var [last time] = (0);
}

Command (render) {
    resize canvas to width (width) height (height) and erase everything;
    draw image ("background.png") at x (0) y (0) with width (width) height (height);
    draw image ("left_paddle.png") at x (paddle margin) y (left paddle top) with width (paddle width) height (paddle height);
    draw image ("right_paddle.png") at x (((width) - (paddle margin)) - (paddle width)) y (right paddle top) with width (paddle width) height (paddle height);
    draw image ("ball.png") at x (ball left) y (ball top) with width (ball width) height (ball height);
}

Command (update) {
    let [current time] = (milliseconds since unix epoch);
    if ((last time) == (0)) {
        set [last time] to (current time);
        reset ball and paddles;
        return;
    };
    let [elapsed time in seconds] = (((current time) - (last time)) / (1000));
    set [last time] to (current time);

    let [w was down] = (w down);
    let [s was down] = (s down);
    let [i was down] = (i down);
    let [k was down] = (k down);

    set [w down] to (key ("w") pressed?);
    set [s down] to (key ("s") pressed?);
    set [i down] to (key ("i") pressed?);
    set [k down] to (key ("k") pressed?);

    var [left dy] = (0);

    if (((w down) and (not (w was down))) and (((left paddle top) - (paddle height)) >= (min paddle y))) {
        set [left dy] to ((-1) * (paddle height));
    };
    if (((s down) and (not (s was down))) and (((left paddle top) + (paddle height)) <= (max paddle y))) {
        set [left dy] to (paddle height);
    };

    var [right dy] = (0);

    if (((i down) and (not (i was down))) and (((right paddle top) - (paddle height)) >= (min paddle y))) {
        set [right dy] to ((-1) * (paddle height));
    };
    if (((k down) and (not (k was down))) and (((right paddle top) + (paddle height)) <= (max paddle y))) {
        set [right dy] to (paddle height);
    };

    increase [left paddle top] by (left dy);
    increase [right paddle top] by (right dy);

    let [ball dx] = ((x speed) * (elapsed time in seconds));
    let [ball dy] = ((y speed) * (elapsed time in seconds));

    increase [ball left] by (ball dx);
    increase [ball top] by (ball dy);

    if ball is out of bounds, update score and reset ball;
    if ball is colliding with paddle, bounce;
    if ball is colliding with top or bottom wall, bounce;
}

Command (reset ball and paddles) {
    reset ball;
    set [left paddle top] to (((height) / (2)) - ((paddle height) / (2)));
    set [right paddle top] to (((height) / (2)) - ((paddle height) / (2)));
}

Number Query ((Number degrees) degrees in radians) {
    return (((degrees) * (pi)) / (180));
}

Command (reset ball) {
    set [ball left] to (((width) / (2)) - ((ball width) / (2)));
    set [ball top] to (((height) / (2)) - ((ball height) / (2)));
    let [angle] = ((random integer from (0) up to but not including (360)) degrees in radians);
    set [x speed] to ((cos of (angle) radians) * (ball speed magnitude));
    set [y speed] to ((sin of (angle) radians) * (ball speed magnitude));
}

Command (if ball is out of bounds, update score and reset ball) {
    let [ball right] = ((ball left) + (ball width));
    if ((ball right) < (0)) {
        increase [right score] by (1);
        reset ball;
        return;
    };
    if ((ball left) > (width)) {
        increase [left score] by (1);
        reset ball;
        return;
    };
}

Command (if ball is colliding with paddle, bounce) {
    if (ball is touching left paddle?) {
        set [x speed] to (abs (x speed));
    };
    if (ball is touching right paddle?) {
        set [x speed] to ((-1) * (abs (x speed)));
    };
}

Boolean Query (ball is touching left paddle?) {
    let [ball right] = ((ball left) + (ball width));
    let [ball bottom] = ((ball top) + (ball height));

    let [paddle left] = (paddle margin);
    let [paddle right] = ((paddle margin) + (paddle width));
    let [paddle top] = (left paddle top);
    let [paddle bottom] = ((left paddle top) + (paddle height));

    let [in horizontal bounds?] = (((ball left) <= (paddle right)) and ((ball right) >= (paddle left)));
    let [in vertical bounds?] = (((ball top) <= (paddle bottom)) and ((ball bottom) >= (paddle top)));
    return ((in horizontal bounds?) and (in vertical bounds?));
}

Boolean Query (ball is touching right paddle?) {
    let [ball right] = ((ball left) + (ball width));
    let [ball bottom] = ((ball top) + (ball height));

    let [paddle right] = ((width) - (paddle margin));
    let [paddle left] = ((paddle right) - (paddle width));
    let [paddle top] = (right paddle top);
    let [paddle bottom] = ((right paddle top) + (paddle height));

    let [in horizontal bounds?] = (((ball left) <= (paddle right)) and ((ball right) >= (paddle left)));
    let [in vertical bounds?] = (((ball top) <= (paddle bottom)) and ((ball bottom) >= (paddle top)));
    return ((in horizontal bounds?) and (in vertical bounds?));
}

Command (if ball is colliding with top or bottom wall, bounce) {
    let [ball bottom] = ((ball top) + (ball height));
    let [is touching top wall?] = ((ball top) <= (0));
    if (is touching top wall?) {
        set [y speed] to (abs (y speed));
    };
    let [is touching bottom wall?] = ((ball bottom) >= (height));
    if (is touching bottom wall?) {
        set [y speed] to ((-1) * (abs (y speed)));
    };
}
