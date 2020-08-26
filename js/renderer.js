class Renderer {
	constructor (context) {
		this.context = context
		this.graphics = []
		this.garbage = []
	}
	drawCircle (color, position, radius) {
		this.context.beginPath()
		this.context.arc(position.x, position.y, radius, 0, 2 * Math.PI, false)
		this.context.fillStyle = color
		this.context.fill()
	}
	clear (position, size) {
		this.context.clearRect(position.x, position.y, size.width, size.height)
		return this
	}
	collectGarbage () {
		let index = 0
		for (const graphic of this.garbage) {
			this.graphics.splice(graphic.id - index, 1)
			++index
		}
		this.garbage.length = 0
	}
	render () {
		let index = 0
		for (const graphic of this.graphics) {
			if (graphic.shape instanceof Sphere && graphic.active) {
				this.drawCircle(graphic.color, graphic.position, graphic.shape.radius)
			} else if (!graphic.active) {
				graphic.id = index // keep track of index to avoid usage of indexOf() when destroying the body
				this.garbage.push(graphic)
			}
			++index
		}
		this.collectGarbage()

		return this
	}
}