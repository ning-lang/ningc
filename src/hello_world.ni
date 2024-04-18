// You can declare global variables in the `Global` section:
Global {
    var [x] = (0);
    var [time] = (milliseconds since unix epoch);
    var [ball left] = (230);

    // `let` is similar to `var`, except
    // the created variable is not reassignable.
    let [width] = (480);
    let [height] = (360);
    let [ball diameter] = (20);

}

// `render` is a special command that is called every frame.
Command (render) {
    resize canvas to width (width) height (height) and erase everything;
    draw image ("background.png") at x (0) y (0) with width (width) height (height);
    draw image ("ball.png") at x (ball left) y (170) with width (ball diameter) height (ball diameter);
}

// `update` is a special command that is also called every frame.
Command (update) {
    let [current time] = (milliseconds since unix epoch);
    let [elapsed time] = ((current time) - (time));

    if (key ("left arrow") pressed?) {
        increase [ball left] by ((elapsed time) / (-10));
    };

    if (key ("right arrow") pressed?) {
        increase [ball left] by ((elapsed time) / (10));
    };

    if (key ("space") pressed?) {
        reset ball;
    };

    set [time] to (current time);
}

// You can define your own commands.
// For example, here's how you might define a `reset ball` command:
Command (reset ball) {
    set [ball left] to (230);
}
