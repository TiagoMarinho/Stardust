class AABB {
	constructor (position, size) {
		this.position = position
		this.size = size
	}
	containsPoint (point) {
		if (point.x >= this.leftEdgeX &&
			point.x <= this.rightEdgeX &&
			point.y >= this.topEdgeY &&
			point.y <= this.bottomEdgeY)
			return true

		return false
	}
	containsPointDebug (point) { 
		debugger
		if (point.x >= this.leftEdgeX &&
			point.x <= this.rightEdgeX &&
			point.y >= this.topEdgeY &&
			point.y <= this.bottomEdgeY)
			return true

		return false
	}
	get topEdgeY () {
		return this.position.y
	}
	get leftEdgeX () {
		return this.position.x
	}
	get rightEdgeX () {
		return this.position.x + this.size.width
	}
	get bottomEdgeY () {
		return this.position.y + this.size.height
	}
}