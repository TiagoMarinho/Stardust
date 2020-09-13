// TODO: make adaptive boundary size

class BarnesHutTree {
	constructor (boundary, debugRenderer) {
		this.boundary = boundary
		this.capacity = 1
		this.children = []
		this.bodies = []

		this.mass = 0
		this.centerOfMass = new Point(0, 0)

		this.debugRenderEmptyNodes = false
		this.debugRenderChildNodes = false
		this.debugRenderParentNodes = false
		this.debugRenderCenterOfMass = false

		this.debugRenderer = debugRenderer
		this.shape = new Rect(boundary.size)
		this.graphics = new Graphics("#fff", boundary.position, this.shape)
		this.debugRenderer.debugGraphics.push(this.graphics)
		this.graphics.active = this.debugRenderEmptyNodes

		// TODO: Cleanup!
		this.shape2 = new Sphere(0.5)
		this.graphics2 = new Graphics("rgba(255, 0, 0, 1.0)", this.centerOfMass, this.shape2)
		this.debugRenderer.debugGraphics.push(this.graphics2)
		this.graphics2.active = false
	}
	get isEndNode () {
		return this.children.length === 0
	}
	get isSubdivided () {
		return this.children.length > 0
	}
	get isPopulated () {
		return this.bodies.length > 0
	}
	get body () {
		if (this.isEndNode)
			return this.bodies[0]
		else throw new Error("BarnesHutTree.body: Tried getting body of parent node")
	}
	insert (body) {
		if (!this.boundary.containsPoint(body.position))
			return false

		this.centerOfMass.x = (this.centerOfMass.x * this.mass + body.position.x * body.mass) / (this.mass + body.mass)
		this.centerOfMass.y = (this.centerOfMass.y * this.mass + body.position.y * body.mass) / (this.mass + body.mass)
		this.mass += body.mass
		
		if (this.debugRenderCenterOfMass) this.graphics2.active = true

		if (this.bodies.length < this.capacity &&
			!this.isSubdivided) {
			this.bodies.push(body)
			if (this.debugRenderChildNodes) this.graphics.active = true
			return true
		}

		if (!this.isSubdivided) {
			this.subdivide()
		}

		for (let quadTree of this.children) {
			if (quadTree.insert(body)) return true
		}
		for (let quadTree of this.children) {
			if (quadTree.insertDebug(body)) return true
		}

		throw new Error("BarnesHutTree.insert: Could not add body to tree")
	}
	insertDebug (body) {
		this.boundary.containsPointDebug(body.position)
	}
	subdivide () {
		if (!this.isSubdivided) {

			const width = this.boundary.size.width / 2,
				height = this.boundary.size.height / 2,
				size = new Size(width, height)

			for (let row = 0; row < 2; ++row) {

				const y = this.boundary.position.y + height * row

				for (let column = 0; column < 2; ++column) {

					const x = this.boundary.position.x + width * column,
						position = new Point(x, y),
						boundary = new AABB(position, size),
						subdividedQuad = new BarnesHutTree(boundary, this.debugRenderer)

					this.children.push(subdividedQuad)
				}
			}
		} else return false

		for (let body of this.bodies) { // move previous bodies to endnodes
			this.insert(body)
		}

		this.bodies.length = 0

		if (!this.debugRenderParentNodes) this.graphics.active = false
	}
	forEachNode (callback) {
		let keepGoing = callback(this)
		if (keepGoing && this.isSubdivided) {
			for (const node of this.children) {
				node.forEachNode(callback)
			}
		}
	}
}