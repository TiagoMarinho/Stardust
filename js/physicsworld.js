class PhysicsWorld {
	constructor (debugRenderer) {
		this.G = 0.01
		this.iterations = 1
		this.bodies = []
		this.intersections = []
		this.garbage = []
		this.barnesHutTree = null
		this.theta = 0.75
		this.computationsPerIteration = 0
		this.debugRenderer = debugRenderer
		this.adaptiveDomainBoundary = new AABB(new Point(0, 0), new Size(innerWidth, innerHeight))
		this.enforceSquareNodes = false//true
		this.useAdaptiveDomainBoundary = false//true
	}
	createBarnesHutTree () {
		const position = new Point(0, 0),
			size = new Size(window.innerWidth, window.innerHeight),
			boundary = new AABB(position, size)
		this.barnesHutTree = new BarnesHutTree(this.adaptiveDomainBoundary, this.debugRenderer)

		for (let body of this.bodies) {
			this.barnesHutTree.insert(body)
		}
	}
	integrator () {
		let index = 0

		let position = new Point(Infinity, Infinity),
			size = new Size(-Infinity, -Infinity)

		for (const body of this.bodies) {

			body.userData.bodiesArrayIndex = index

			body.pastPosition.x = body.position.x
			body.pastPosition.y = body.position.y
			body.position.x += body.velocity.dx / this.iterations
			body.position.y += body.velocity.dy / this.iterations

			// Store maximum and minimum body positions to use as adaptive domain boundary
			position.x = Math.min(body.position.x, position.x)
			position.y = Math.min(body.position.y, position.y)
			size.width = Math.max(body.position.x, size.width)
			size.height = Math.max(body.position.y, size.height)

			++index
		}

		// Use stored body positions and adaptive domain boundary
		const margin = 1 // workaround for floating point errors preventing body from being added to tree
		position.x -= margin
		position.y -= margin
		size.width = size.width - position.x + margin / 2
		size.height = size.height - position.y + margin / 2
		if (this.enforceSquareNodes) {
			size.width = Math.max(size.width, size.height)
			size.height = Math.max(size.width, size.height)
		}
		if (this.useAdaptiveDomainBoundary)
			this.adaptiveDomainBoundary = new AABB(position, size)
	}
	traverseTree () {
    	const thetaSquare = this.theta * this.theta
		this.computationsPerIteration = 0

		const n = this.bodies.length
		this.computationsPerIteration = n * Math.log(n)

		let index = 0

		for (const body of this.bodies) {
			++index

	      	const bodyPositionX = body.position.x,
	      		bodyPositionY = body.position.y

			this.barnesHutTree.forEachNode(node => {
				const distanceX = node.centerOfMass.x - bodyPositionX,
					distanceY = node.centerOfMass.y - bodyPositionY,
					distanceSquare = distanceX * distanceX + distanceY * distanceY,
					nodeBoundarySize = node.boundary.size,
					maxNodeSideLengthSquare = (nodeBoundarySize.width > nodeBoundarySize.height ? 
						nodeBoundarySize.squareWidth : nodeBoundarySize.squareHeight),
					isNodeFarEnoughToApproximateAsSingleBody = maxNodeSideLengthSquare / distanceSquare < thetaSquare

				if (isNodeFarEnoughToApproximateAsSingleBody || node.isEndNode) {

					if (node.isEndNode && node.isPopulated) {
						if (node.body === body) return false

						const radiiSum = node.body.shape.radius + body.shape.radius,
							radiiSumSquare = radiiSum * radiiSum

						if (radiiSumSquare > distanceSquare) {
							if (body.collidable && node.body.collidable)
								this.markAsIntersection(body, node.body)

							return false
						}
					}

					if (node.isPopulated || node.isSubdivided) { // this if condition is a quick test, might be breaking everything
						const distance = Math.sqrt(distanceSquare),
							force = this.G * ((body.mass * node.mass) / distanceSquare),
							forceByIteration = force / this.iterations

						body.velocity.dx += (forceByIteration / body.mass) * distanceX / distance
						body.velocity.dy += (forceByIteration / body.mass) * distanceY / distance


						if (index === 1) {
							let color
							const alpha = 0.25
							if (node.isEndNode) {
								color = `rgba(0, 128, 255, ${alpha})`
							} else {
								color = `rgba(255, 0, 0, ${alpha})`
							}
							const lineShape = new Line(body.position, node.centerOfMass, 2)
							const graphics = new Graphics(color, body.position, lineShape)
							this.debugRenderer.debugGraphics.push(graphics)
						}
					}

					return false
				} else return true
			})
		}
	}
	markAsIntersection (bodyA, bodyB) {
		const isAlreadyIntersectingWithAnotherBody = {
				bodyA: bodyA.contact !== null,
				bodyB: bodyB.contact !== null
			},
			numberOfBodiesWithPreviousIntersections = 
				isAlreadyIntersectingWithAnotherBody.bodyA + 
				isAlreadyIntersectingWithAnotherBody.bodyB

		switch (numberOfBodiesWithPreviousIntersections) {
			case 0:
				const intersection = [bodyA, bodyB],
					index = this.intersections.length

				bodyA.contact = index
				bodyB.contact = index

				this.intersections.push(intersection)
				break
			case 1:
				if (isAlreadyIntersectingWithAnotherBody.bodyA) {
					bodyB.contact = bodyA.contact
					this.intersections[bodyA.contact].push(bodyB)
				} else {
					bodyA.contact = bodyB.contact
					this.intersections[bodyB.contact].push(bodyA)
				}
				break
			case 2:
				if (bodyA.contact !== bodyB.contact) {
					const oldIndex = bodyB.contact
					for (const bodyC of this.intersections[bodyB.contact]) {
						this.intersections[bodyA.contact].push(bodyC)
						bodyC.contact = bodyA.contact
					}
					this.intersections[oldIndex].length = 0 // can't remove array element otherwise all indexes after it would get messed up
				}
				break
		}
	}
	mergeIntersectingBodies () {
		for (const intersection of this.intersections) {
			if (intersection.length > 0) {
				let bodyA = intersection[0]
				for (let i = 1; i < intersection.length; ++i) {
					let bodyB = intersection[i]

					if (bodyB.mass > bodyA.mass) {
						const buffer = bodyA
						bodyA = bodyB
						bodyB = buffer
					}

					bodyA.position.x = Utils.getWeightedAverage(bodyA.position.x, bodyA.mass, bodyB.position.x, bodyB.mass)
					bodyA.position.y = Utils.getWeightedAverage(bodyA.position.y, bodyA.mass, bodyB.position.y, bodyB.mass)

					bodyA.velocity.dx = Utils.getWeightedAverage(bodyA.velocity.dx, bodyA.mass, bodyB.velocity.dx, bodyB.mass)
					bodyA.velocity.dy = Utils.getWeightedAverage(bodyA.velocity.dy, bodyA.mass, bodyB.velocity.dy, bodyB.mass)

					bodyA.shape.volume += bodyB.shape.volume / bodyA.density

					this.garbage.push(bodyB.userData.bodiesArrayIndex)

					bodyB.contact = null
				}
				bodyA.contact = null
			}
		}
		this.intersections.length = 0
	}
	collectGarbage () {
		let numberOfDeletedItems = 0

		const sortAlgorithmDescendingOrder = (a, b) => b - a
		this.garbage.sort(sortAlgorithmDescendingOrder) // prevents from having to shift the index of subsequent items

		for (const index of this.garbage) {
			const body = this.bodies[index]

			this.bodies.splice(index, 1)
			body.destroy()

			++numberOfDeletedItems
		}
		this.garbage.length = 0
	}
	step () {
		for (let i = 0; i < this.iterations; ++i) {
			this.integrator()

			this.createBarnesHutTree()
			this.traverseTree()

			this.mergeIntersectingBodies()
			this.collectGarbage()
		}
	}
}