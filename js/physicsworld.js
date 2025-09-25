class PhysicsWorld {

	G = 0.01
	iterations = 1
	bodies = []
	intersections = []
	garbage = []
	barnesHutTree = null
	theta = 0.2
	computationsPerIteration = 0
	adaptiveDomainBoundary = new AABB(new Point(0, 0), new Size(innerWidth, innerHeight))
	enforceSquareNodes = false
	useAdaptiveDomainBoundary = false

	isIntersecting (bodyA, bodyB) {
		const distanceX = bodyB.position.x - bodyA.position.x,
			distanceY = bodyB.position.y - bodyA.position.y,
			distanceSquare = distanceX * distanceX + distanceY * distanceY,
			radiusSum = bodyA.shape.radius + bodyB.shape.radius,
			radiusSumSquare = radiusSum * radiusSum

		return distanceSquare < radiusSumSquare
	}
	runOnceForEveryBodyPair (callback) {
		let indexA = 0
		for (const bodyA of this.bodies) {
			for (let indexB = indexA + 1; indexB < this.bodies.length; ++indexB) {
				const bodyB = this.bodies[indexB]

				bodyA.userData.bodiesArrayIndex = indexA
				bodyB.userData.bodiesArrayIndex = indexB

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
			this.markAsIntersection(bodyA, bodyB)

			const collisionPoint = {
				x: (bodyA.position.x * bodyA.mass + bodyB.position.x * bodyB.mass) / (bodyA.mass + bodyB.mass),
				y: (bodyA.position.y * bodyA.mass + bodyB.position.y * bodyB.mass) / (bodyA.mass + bodyB.mass)
			}
			const normalizedRadius = {
				bodyA: distance * (1 / (bodyA.mass + bodyB.mass) * bodyA.mass),
				bodyB: distance * (1 / (bodyA.mass + bodyB.mass) * bodyB.mass)
			}
			const normalizedVolume = {
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

			this.runOnceForEveryBodyPair((bodyA, bodyB) => this.applyGravityBetweenBodies(bodyA, bodyB))

			this.mergeIntersectingBodies()
			this.collectGarbage()
		}
	}
}