class Utils {
	constructor () {

	}
	static getRandomFloat(min, max) {
		return Math.random() * (max - min) + min;
	}
	static getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	static getRandomBool() {
		return Math.floor(Math.random() * 2) === 1;
	}
	static getRandomItem(arr) {
		return arr[Utils.getRandomInt(0, arr.length - 1)];
	}
	static distanceToPointSquare (v, w) {
		return (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y)
	}
	static distanceToSegmentSquare (p, v, w) {
		const closestPointInSegment = this.closestPointInSegment(p, v, w)
		return this.distanceToPointSquare(p, closestPointInSegment)
	}
	static closestPointInSegment (p, v, w) {
		const lineSegmentLength = this.distanceToPointSquare(v, w)
		if (lineSegmentLength === 0) return v
		const t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / lineSegmentLength
		if (t < 0) return v
		if (t > 1) return w
		return {
			x: v.x + t * (w.x - v.x), 
			y: v.y + t * (w.y - v.y)
		}
	}
	static distanceBetweenSegmentsSquare (c1, p1, c2, p2) {
		return Math.min(
			Utils.distanceToSegmentSquare(c1, c2, p2),
			Utils.distanceToSegmentSquare(p1, c2, p2),
			Utils.distanceToSegmentSquare(c2, c1, p1),
			Utils.distanceToSegmentSquare(p2, c1, p1)
		)
	}
	static getWeightedAverage (valueA, weightA, valueB, weightB) {
		return (valueA * weightA + valueB * weightB) / (weightA + weightB)
	}
}
