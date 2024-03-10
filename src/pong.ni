@const width = 480;
@const height = 360;
@const paddle width = 20;
@const paddle height = (height) / (5);
@const paddle width = 20;
@const paddle margin = paddle width;
@const ball width = paddle width;
@const ball height = ball width;

@var left paddle top = ((height) / (2)) - ((paddle height) / (2));
@var right paddle top = ((height) / (2)) - ((paddle height) / (2));
@var ball left = ((width) / (2)) - ((ball width) / (2));
@var ball top = ((height) / (2)) - ((ball height) / (2));
@var x speed = 0
@var y speed = 0
@var left score = 0;
@var right score = 0;

@var w down = false
@var s down = false
@var up down = false
@var down down = false

@func render {
    resize canvas to width (width) height (height);
    draw image ('background.png') at x (0) y (0) with width (width) height (height);
    draw image ('left_paddle.png') at x (paddle margin) y (left paddle top) with width (paddle width) height (paddle height);
    draw image ('right_paddle.png') at x (width - paddle margin - paddle width) y (right paddle top) with width (paddle width) height (paddle height);
    draw image ('ball.png') at x (ball left) y (ball top) with width (ball width) height (ball height);
}

@func update {
    @const w was down = w down;
    @const s was down = s down;
    @const up was down = up down;
    @const down was down = down down;

    (w down) = is key down ('w');
    (s down) = is key down ('s');
    (up down) = is key down ('up');
    (down down) = is key down ('down');

    @var left dy = 0;

    if ((w down) and (not (w was down))) {
        (left dy) = ((-1) * (paddle height))
    };
    if ((s down) and (not (s was down))) {
        (left dy) = (paddle height)
    };

    @var right dy = 0;

    if ((up down) and (not (up was down))) {
        (right dy) = ((-1) * (paddle height))
    };
    if ((down down) and (not (down was down))) {
        (right dy) = (paddle height)
    };


}
