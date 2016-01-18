//"use strict";
class Bend extends Arrow {
    constructor(x, y) {
        super(x, y, 12, "#FFF", 3);
		this.radius = 0;
		this.vx = this.vy = 0;
        this.isBend = true;
    }
    refresh() {
        this.rotation = Math.atan2(this.vy, this.vx) / Math.PI * 180;
        if (this.rotation === 0) this.rotation = -135;
        this.vx /= 1.5;
        this.vy /= 1.5;
    }
}
