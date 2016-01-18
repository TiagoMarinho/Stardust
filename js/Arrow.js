class Arrow extends createjs.Shape {
	constructor (x, y, length, color, strokeWidth) {
        super();
        var l = length, hl = length / 2, s = strokeWidth;
        this.graphics.s(color).ss(s).mt(-l, 0).lt(0, 0).mt(-hl, -hl).lt(0, 0).lt(-hl, hl);
        this.set({
            x, y,
            color: color
        });
        this.isBend = true;
        this.cache(-l - s, -hl - s, l + s*2, l + s*2, 2);
	}
}
