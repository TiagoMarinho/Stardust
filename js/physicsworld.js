/*
 *	TODO: clean up barnes-hut implementation and add back lost functionality such as collision
 *	should be trivial to add collision back as we only have to test endnodes that are closer than threshold
 */

class PhysicsWorld {
	constructor (debugRenderer) {
		this.G = 0.01
		this.iterations = 1
		this.bodies = []
		this.intersections = []
		this.garbage = []
		this.quadTree = null
		this.debugRenderer = debugRenderer
		this.barnesHutThreshold = 0.5
	}
	createQuadTree () {
		const position = new Point(0, 0),
			size = new Size(window.innerWidth, window.innerHeight),
			boundary = new AABB(position, size)
		this.quadTree = new BarnesHutTree(boundary, this.debugRenderer)

		for (let body of this.bodies) {
			this.quadTree.insert(body)
		}
	}
	applyVelocityToPosition () {
		for (const body of this.bodies) {
			body.pastPosition.x = body.position.x
			body.pastPosition.y = body.position.y
			body.position.x += body.velocity.dx / this.iterations
			body.position.y += body.velocity.dy / this.iterations
		}
	}
	traverseTree () {
		for (const body of this.bodies) {
			this.quadTree.forEachNode(node => {
				const distanceX = node.centerOfMass.x - body.position.x,
					distanceY = node.centerOfMass.y - body.position.y,
					distanceSquare = distanceX * distanceX + distanceY * distanceY,
					distance = Math.sqrt(distanceSquare),
					averageNodeSideLength = Math.max(node.boundary.size.width, node.boundary.size.height),
					isEndNode = node.isEndNode

				if (averageNodeSideLength / distance < this.barnesHutThreshold || isEndNode) {

					if (isEndNode && node.isPopulated) {
						if (node.body === body) return false
						if (node.body.shape.radius + body.shape.radius > distance) {
							if (body.collidable && node.body.collidable) 
								this.markAsIntersection(body, node.body)
							return false
						}
					}

					const force = this.G * ((body.mass * node.mass) / distanceSquare),
						forceByIteration = force / this.iterations

					body.velocity.dx += (forceByIteration / body.mass) * distanceX / distance
					body.velocity.dy += (forceByIteration / body.mass) * distanceY / distance

					return false
				} else return true
			})
		}
	}
	runOnceForEveryBodyPair (callback) {
		let indexA = 0
		for (const bodyA of this.bodies) {
			for (let indexB = indexA + 1; indexB < this.bodies.length; ++indexB) {
				const bodyB = this.bodies[indexB]
				callback(bodyA, bodyB)
			}
			++indexA
		}
	}
	applyGravityBetweenBodies (bodyA, bodyB) {

		const distanceX = bodyB.position.x - bodyA.position.x,
			distanceY = bodyB.position.y - bodyA.position.y,
			distanceSquare = distanceX * distanceX + distanceY * distanceY,
			distance = Math.sqrt(distanceSquare),
			radiusSum = bodyA.shape.radius + bodyB.shape.radius,
			radiusSumSquare = radiusSum * radiusSum,
			normalizedMasses = {bodyA: bodyA.mass, bodyB: bodyB.mass},
			isIntersecting = distance < radiusSum

		if (isIntersecting) { // simpleOrbit test-case fails when the bodies intersect - loss of conservation of energy
			const collisionPoint = {
					x: (bodyA.position.x * bodyA.mass + bodyB.position.x * bodyB.mass) / (bodyA.mass + bodyB.mass),
					y: (bodyA.position.y * bodyA.mass + bodyB.position.y * bodyB.mass) / (bodyA.mass + bodyB.mass)
				},
				normalizedRadius = {
					bodyA: distance * (1 / (bodyA.mass + bodyB.mass) * bodyA.mass),
					bodyB: distance * (1 / (bodyA.mass + bodyB.mass) * bodyB.mass)
				},
				normalizedVolume = {
					bodyA: 4 / 3 * Math.PI * (normalizedRadius.bodyA * normalizedRadius.bodyA * normalizedRadius.bodyA),
					bodyB: 4 / 3 * Math.PI * (normalizedRadius.bodyB * normalizedRadius.bodyB * normalizedRadius.bodyB)
				}

			normalizedMasses.bodyA = normalizedVolume.bodyA * bodyA.density
			normalizedMasses.bodyB = normalizedVolume.bodyB * bodyB.density
		}

		const force = this.G * ((normalizedMasses.bodyA * normalizedMasses.bodyB) / distanceSquare),
			forceByIteration = force / this.iterations

		bodyA.velocity.dx += (forceByIteration / normalizedMasses.bodyA) * distanceX / distance
		bodyA.velocity.dy += (forceByIteration / normalizedMasses.bodyA) * distanceY / distance

		bodyB.velocity.dx -= (forceByIteration / normalizedMasses.bodyB) * distanceX / distance
		bodyB.velocity.dy -= (forceByIteration / normalizedMasses.bodyB) * distanceY / distance
		
	}
	isIntersecting (bodyA, bodyB) { // I feel like this does not belong here
		const distanceX = bodyB.position.x - bodyA.position.x,
			distanceY = bodyB.position.y - bodyA.position.y,
			distanceSquare = distanceX * distanceX + distanceY * distanceY,
			radiusSum = bodyA.shape.radius + bodyB.shape.radius,
			radiusSumSquare = radiusSum * radiusSum

		return distanceSquare < radiusSumSquare
	}
	markAsIntersection (bodyA, bodyB) {
		if (bodyA.contact === null && bodyB.contact === null) { // no previous intersections involving either body
			const intersection = [bodyA, bodyB],
				index = this.intersections.length

			bodyA.contact = index
			bodyB.contact = index

			this.intersections.push(intersection)
		}
		if (bodyA.contact !== null && bodyB.contact === null) { // bodyA had a previous intersection
			bodyB.contact = bodyA.contact
			this.intersections[bodyA.contact].push(bodyB)
		}
		if (bodyA.contact === null && bodyB.contact !== null) { // bodyB had a previous intersection
			bodyA.contact = bodyB.contact
			this.intersections[bodyB.contact].push(bodyA)
		}
		if (bodyA.contact !== null && bodyB.contact !== null && bodyA.contact !== bodyB.contact) { // both had previous distinct intersections
			const oldIndex = bodyB.contact
			for (const bodyC of this.intersections[bodyB.contact]) {
				this.intersections[bodyA.contact].push(bodyC)
				bodyC.contact = bodyA.contact
			}
			this.intersections[oldIndex].length = 0 // can't remove array element otherwise all indexes after it would get messed up
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

					bodyA.position.x = (bodyA.position.x * bodyA.mass + bodyB.position.x * bodyB.mass) / (bodyA.mass + bodyB.mass)
					bodyA.position.y = (bodyA.position.y * bodyA.mass + bodyB.position.y * bodyB.mass) / (bodyA.mass + bodyB.mass)

					bodyA.velocity.dx = (bodyA.velocity.dx * bodyA.mass + bodyB.velocity.dx * bodyB.mass) / (bodyA.mass + bodyB.mass)
					bodyA.velocity.dy = (bodyA.velocity.dy * bodyA.mass + bodyB.velocity.dy * bodyB.mass) / (bodyA.mass + bodyB.mass)

					bodyA.shape.volume += bodyB.shape.volume

					this.garbage.push(bodyB)

					bodyB.contact = null
				}
				bodyA.contact = null
			}
		}
		this.intersections.length = 0
	}
	collectGarbage () {
		for (const body of this.garbage) {
			this.bodies.splice(this.bodies.indexOf(body), 1)
			body.destroy()
		}
		this.garbage.length = 0
	}
	step () {
		for (let i = 0; i < this.iterations; ++i) {
			
			this.applyVelocityToPosition()

			this.createQuadTree()

			this.traverseTree()

			/*this.runOnceForEveryBodyPair((bodyA, bodyB) => {
				if (this.isIntersecting(bodyA, bodyB) &&
					bodyA.collidable && bodyB.collidable) {

					this.markAsIntersection(bodyA, bodyB)
					return
				}

				this.applyGravityBetweenBodies(bodyA, bodyB)
			})*/

			this.mergeIntersectingBodies()
			this.collectGarbage()
		}
	}
}