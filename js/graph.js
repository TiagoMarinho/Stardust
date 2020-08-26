class Graph {
	constructor (context, app) {
		this.context = context
		this.app = app
		this.x = 0
		this.last = new Point(0, 0)
	}
	run () {
		const bodyA = this.app.scene.physicsWorld.bodies[0],
			bodyB = this.app.scene.physicsWorld.bodies[1]

		this.last.x = bodyA.position.x
		this.last.y = innerHeight
		this.step(bodyA, bodyB)
	}
	drawLine (color, from, to, radius) {
		this.context.beginPath()
		this.context.moveTo(from.x, from.y)
		this.context.lineTo(to.x, to.y)
		this.context.strokeStyle = color
		this.context.stroke()
	}
	step (bodyA, bodyB) {
		const x = bodyA.position.x, 
			y = innerHeight - (bodyA.force * 1000)
		this.drawLine("#fff", this.last, new Point(x, y), 1)

		this.last.x = x
		this.last.y = y

		requestAnimationFrame(_ => {
			this.step(bodyA, bodyB)
		})
	}
}