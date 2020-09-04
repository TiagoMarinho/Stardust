class Renderer {
	constructor (context) {
		this.context = context
		this.graphics = []
		this.debugGraphics = []
		this.garbage = []
	}
	drawRect (color, position, size) {
		this.context.beginPath()
		this.context.strokeStyle = color
		this.context.lineWidth = 1
		this.context.strokeRect(Math.floor(position.x) + .5, Math.floor(position.y) + .5, Math.floor(size.width), Math.floor(size.height))
		this.context.fill()
	}
	drawCircle (color, position, radius) {
		this.context.beginPath()
		this.context.fillStyle = color
		this.context.arc(position.x, position.y, radius, 0, 2 * Math.PI, false)
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
		for (const graphic of this.debugGraphics) {
			if (graphic.shape instanceof Sphere && graphic.active) {
				this.drawCircle(graphic.color, graphic.position, graphic.shape.radius)
			}
			if (graphic.shape instanceof Rect && graphic.active) {
				this.drawRect(graphic.color, graphic.position, graphic.shape.size)
			}
		}
		this.debugGraphics.length = 0
		
		let index = 0
		for (const graphic of this.graphics) {
			if (graphic.shape instanceof Sphere && graphic.active) {
				this.drawCircle(graphic.color, graphic.position, graphic.shape.radius)
			} else if (graphic.shape instanceof Rect && graphic.active) {
				this.drawRect(graphic.color, graphic.position, graphic.shape.size)
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