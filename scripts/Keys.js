var Key = function () {
    this.UP = 38;
    this.LEFT = 37;
    this.RIGHT = 39;
    this.DOWN = 40;
    this.W = 87;
    this.A = 65;
    this.S = 83;
    this.D = 68;
    this.SPACE_BAR = 32;
    this.SHIFT = 16;
    this.ALT = 18;
};

Key.prototype.toggleActive = function (key) {
    this[key] = !this[key];
};
Key.prototype.isDown = function (key) {
    return this[key];
};

var key = new Key();
$(window).on("keydown", function (e) {
    if (!key.isDown(e.keyCode)) {
        key.toggleActive(e.keyCode);
    }
});
$(window).on("keyup", function (e) {
    if (key.isDown(e.keyCode)) {
        key.toggleActive(e.keyCode);
    }
});
