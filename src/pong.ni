@const [width] = (480);
@const [height] = (360);
@const [paddle width] = (20);
@const [paddle height] = ((height) / (5));
@const [paddle margin] = (paddle width);
@const [ball width] = (paddle width);
@const [ball height] = (ball width);
@const [ball speed magnitude] = ((ball width) * (3));

@var [left paddle top] = (((height) / (2)) - ((paddle height) / (2)));
@var [right paddle top] = (((height) / (2)) - ((paddle height) / (2)));
@var [ball left] = (((width) / (2)) - ((ball width) / (2)));
@var [ball top] = (((height) / (2)) - ((ball height) / (2)));
@var [x speed] = (0);
@var [y speed] = (0);
@var [left score] = (0);
@var [right score] = (0);

@var [w down] = (false);
@var [s down] = (false);
@var [up down] = (false);
@var [down down] = (false);

@var [last time] = (0);

@func (render) {
    resize canvas to width (width) height (height);
    draw image ('background.png') at x (0) y (0) with width (width) height (height);
    draw image ('left_paddle.png') at x (paddle margin) y (left paddle top) with width (paddle width) height (paddle height);
    draw image ('right_paddle.png') at x (width - paddle margin - paddle width) y (right paddle top) with width (paddle width) height (paddle height);
    draw image ('ball.png') at x (ball left) y (ball top) with width (ball width) height (ball height);
}

@func (update) {
    @const [current time] = (milliseconds since unix epoch);
    if ((last time) = (0)) {
        set [last time] to (current time);
        reset ball and paddles;
        return;
    };
    @const [elapsed time in seconds] = (((current time) - (last time)) / (1000));
    set [last time] to (current time);

    @const [w was down] = (w down);
    @const [s was down] = (s down);
    @const [up was down] = (up down);
    @const [down was down] = (down down);

    set [w down] to (is key down ('w'));
    set [s down] to (is key down ('s'));
    set [up down] to (is key down ('up'));
    set [down down] to (is key down ('down'));

    @var [left dy] = (0);

    if ((w down) and (not (w was down))) {
        set [left dy] to ((-1) * (paddle height));
    };
    if ((s down) and (not (s was down))) {
        set [left dy] to (paddle height);
    };

    @var [right dy] = (0);

    if ((up down) and (not (up was down))) {
        set [right dy] to ((-1) * (paddle height));
    };
    if ((down down) and (not (down was down))) {
        set [right dy] to (paddle height);
    };

    change [left paddle top] by (left dy);
    change [right paddle top] by (right dy);

    @const [ball dx] = ((x speed) * (elapsed time in seconds));
    @const [ball dy] = ((y speed) * (elapsed time in seconds));

    change [ball left] by (ball dx);
    change [ball top] by (ball dy);

    if ball is out of bounds, update score and reset ball;
    if ball is colliding with paddle, bounce;
    if ball is colliding with top or bottom wall, bounce;
}

@func (reset ball and paddles) {
    set [left paddle top] to (((height) / (2)) - ((paddle height) / (2)));
    set [right paddle top] to (((height) / (2)) - ((paddle height) / (2)));
}

@func (reset ball) {
    set [ball left] to (((width) / (2)) - ((ball width) / (2)));
    set [ball top] to (((height) / (2)) - ((ball height) / (2)));
    @const [angle] = (pick random from (0) up to but not including (360))
    set [x speed] to ((cosine of (angle) degrees) * (ball speed magnitude));
    set [y speed] to ((sine of (angle) degrees) * (ball speed magnitude));
}

@func (if ball is out of bounds, update score and reset ball) {
    TODO
}

@func (if ball is colliding with paddle, bounce) {
    TODO
}

@func (if ball is colliding with top or bottom wall, bounce) {
    TODO
}
