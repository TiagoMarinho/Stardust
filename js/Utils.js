//"use strict";
class Utils {
	static getRandomInt(min, max) {
		return ((Math.random() * (max - min + 1)) | 0) + min;
	}
	static getRandomFloat(min, max) {
		return Math.random() * (max - min) + min;
	}
	static sqr(x) {
		return x * x;
	}
	static getRandomItem(arr) {
		return arr[this.getRandomInt(0, arr.length - 1)];
	}
	static distanceToPoint(v, w) {
	    return (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
	}
	static distanceToSegmentSquared(p, v, w) {
	    var lineSegmentLength = this.distanceToPoint(v, w);
	    if (lineSegmentLength === 0) return this.distanceToPoint(p, v);
	    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / lineSegmentLength;
	    if (t < 0) return this.distanceToPoint(p, v);
	    if (t > 1) return this.distanceToPoint(p, w);
	    return this.distanceToPoint(p, {
	        x: v.x + t * (w.x - v.x),
	        y: v.y + t * (w.y - v.y)
	    });
	}
	static distanceBetweenSegmentsSquared(c1, p1, c2, p2) {
		return Math.min(
			Utils.distanceToSegmentSquared(c1, c2, p2),
			Utils.distanceToSegmentSquared(p1, c2, p2),
			Utils.distanceToSegmentSquared(c2, c1, p1),
			Utils.distanceToSegmentSquared(p2, c1, p1)
		);
	}
}
