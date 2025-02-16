class PhysicsWorld {

	G = 0.01
	iterations = 1
	bodies = []
	intersections = []
	garbage = []
	computationsPerIteration = 0

	integrator () {
		for (const [index, body] of this.bodies.entries()) {
			body.userData.bodiesArrayIndex = index
			body.pastPosition.x = body.position.x
			body.pastPosition.y = body.position.y
			body.position.x += body.velocity.dx / this.iterations
			body.position.y += body.velocity.dy / this.iterations
		}
	}
	applyGravityBetween (bodyA, bodyB) {
		const distanceX = bodyB.position.x - bodyA.position.x
		const distanceY = bodyB.position.y - bodyA.position.y
		const distanceSquare = distanceX * distanceX + distanceY * distanceY

		const radiiSum = bodyB.shape.radius + bodyA.shape.radius
		const radiiSumSquare = radiiSum * radiiSum

		if (radiiSumSquare > distanceSquare) {
			if (bodyA.collidable && bodyB.collidable) {
				this.markAsIntersection(bodyA, bodyB)
				return
			}
		}

		const distance = Math.sqrt(distanceSquare) // expensive, maybe avoidable?
		const force = this.G * ((bodyA.mass * bodyB.mass) / distanceSquare)
		const forceByIteration = force / this.iterations

		bodyA.velocity.dx += (forceByIteration / bodyA.mass) * distanceX / distance
		bodyA.velocity.dy += (forceByIteration / bodyA.mass) * distanceY / distance

		bodyB.velocity.dx -= (forceByIteration / bodyB.mass) * distanceX / distance
		bodyB.velocity.dy -= (forceByIteration / bodyB.mass) * distanceY / distance
	}
	forEachPair (callback) {
		this.computationsPerIteration = (this.bodies.length * (this.bodies.length - 1)) / 2
		for (let i = 0; i < this.bodies.length; ++i) {
			const bodyA = this.bodies[i]
			for (let j = i + 1; j < this.bodies.length; ++j) {
				const bodyB = this.bodies[j]

				callback(bodyA, bodyB)
			}
		}
	}
	markAsIntersection (bodyA, bodyB) { // can be made more readable by ditching ifs inside switch and using enums
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
			if (intersection.length === 0) continue
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
		this.intersections.length = 0
	}
	collectGarbage () {

		const sortAlgorithmDescendingOrder = (a, b) => b - a
		this.garbage.sort(sortAlgorithmDescendingOrder) // prevents from having to shift the index of subsequent items

		for (const index of this.garbage) {
			const body = this.bodies[index]

			this.bodies.splice(index, 1)
			body.destroy()
		}
		this.garbage.length = 0
	}
	step () {
		for (let i = 0; i < this.iterations; ++i) {
			this.integrator()

			this.forEachPair(this.applyGravityBetween.bind(this))

			this.mergeIntersectingBodies()
			this.collectGarbage()
		}
	}
}