class Scene {
	constructor (canvas) {
		this.canvas = canvas
		this.context = canvas.getContext("2d")
		this.renderer = new Renderer(this.context)
		this.physicsWorld = new PhysicsWorld()
		this.entities = []
	}
	addChild (...entities) {
		this.entities = [...this.entities, ...entities]

		for (const entity of entities) {
			this.renderer.graphics.push(entity.graphics)
			this.physicsWorld.bodies.push(entity.physicsBody)
		}
	}
	update () {
		const canvasPosition = new Point(0, 0),
			canvasSize = new Size(this.canvas.width, this.canvas.height)

		this.physicsWorld.step()

		for (const entity of this.entities) {
			entity.update()
		}

		this.renderer.clear(canvasPosition, canvasSize).render()
	}
}