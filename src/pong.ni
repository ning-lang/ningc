@def width @as 480;
@def height @as 360;
@def paddle width @as 20;
@def paddle height @as (height) / (5);
@def paddle width @as 20;
@def paddle margin @as paddle width;
@def ball width @as paddle width;
@def ball height @as ball width;

@init left paddle top @to ((height) / (2)) - ((paddle height) / (2));
@init right paddle top @to ((height) / (2)) - ((paddle height) / (2));
@init ball left @to ((width) / (2)) - ((ball width) / (2));
@init ball top @to ((height) / (2)) - ((ball height) / (2));
@init x speed @to 0
@init y speed @to 0
@init left score @to 0;
@init right score @to 0;

@init w down @to false
@init s down @to false
@init up down @to false
@init down down @to false

@init last time @to 0;

@func render {
    resize canvas to width (width) height (height);
    draw image ('background.png') at x (0) y (0) with width (width) height (height);
    draw image ('left_paddle.png') at x (paddle margin) y (left paddle top) with width (paddle width) height (paddle height);
    draw image ('right_paddle.png') at x (width - paddle margin - paddle width) y (right paddle top) with width (paddle width) height (paddle height);
    draw image ('ball.png') at x (ball left) y (ball top) with width (ball width) height (ball height);
}

@func update {
    @def current time @as milliseconds since unix epoch;
    if ((last time) = (0)) {
        set (last time) to (current time);
        reset ball and paddles;
        return;
    };
    @def elapsed time in seconds @as ((current time) - (last time)) / (1000);
    set (last time) to (current time);

    @def w was down @as w down;
    @def s was down @as s down;
    @def up was down @as up down;
    @def down was down @as down down;

    set (w down) to (is key down ('w'));
    set (s down) to (is key down ('s'));
    set (up down) to (is key down ('up'));
    set (down down) to (is key down ('down'));

    @init left dy @to 0;

    if ((w down) and (not (w was down))) {
        set (left dy) to ((-1) * (paddle height));
    };
    if ((s down) and (not (s was down))) {
        set (left dy) to (paddle height);
    };

    @init right dy @to 0;

    if ((up down) and (not (up was down))) {
        set (right dy) to ((-1) * (paddle height));
    };
    if ((down down) and (not (down was down))) {
        set (right dy) to (paddle height);
    };

    change (left paddle top) by (left dy);
    change (right paddle top) by (right dy);

    @def ball dx @as (x speed) * (elapsed time in seconds);
}

@func reset ball and paddles {
    set (left paddle top) to (((height) / (2)) - ((paddle height) / (2)));
    set (right paddle top) to (((height) / (2)) - ((paddle height) / (2)));
    set (ball left) to (((width) / (2)) - ((ball width) / (2)));
    set (ball top) to (((height) / (2)) - ((ball height) / (2)));
    set (x speed) to (0);
    set (y speed) to (0);
}