import Vector from "./vector.js"
import { getWeightedAverage } from "./utils.js"

export default class PhysicsWorld {

	G = 0.01
	iterations = 1
	bodies = []
	intersections = []
	garbage = []
	computationsPerIteration = 0

	integrator () {
		for (const [index, body] of this.bodies.entries()) {
			body.userData.bodiesArrayIndex = index

			body.pastPosition = body.position
			body.position = 
				Vector.add(
					body.position, 
					Vector.divide( // maybe we're creating too many objects?
						body.velocity, 
						this.iterations
					)
				)
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

		const distance = Math.sqrt(distanceSquare)
		const force = this.G * ((bodyA.mass * bodyB.mass) / distanceSquare)
		const forceByIteration = force / this.iterations

		bodyA.velocity.x += (forceByIteration / bodyA.mass) * distanceX / distance
		bodyA.velocity.y += (forceByIteration / bodyA.mass) * distanceY / distance

		bodyB.velocity.x -= (forceByIteration / bodyB.mass) * distanceX / distance
		bodyB.velocity.y -= (forceByIteration / bodyB.mass) * distanceY / distance
	}
	forEachPair (callback) {
		this.computationsPerIteration = 0
		for (let i = 0; i < this.bodies.length; ++i) {
			const bodyA = this.bodies[i]
			for (let j = i + 1; j < this.bodies.length; ++j) {
				const bodyB = this.bodies[j]

				callback(bodyA, bodyB)
				++this.computationsPerIteration
			}
		}
	}
	markAsIntersection (bodyA, bodyB) { // can be converted to functional paradigm by adding the duplicates initially then cleaning up as a separate step

		const isIntersectingWithAnotherBody = {
			bodyA: 
				bodyA.contact === null ? 0 : 1,
			bodyB: 
				bodyB.contact === null ? 0 : 2
		}

		const bodiesWithPreviousIntersections = 
			isIntersectingWithAnotherBody.bodyA + 
			isIntersectingWithAnotherBody.bodyB

		const PreviousIntersectionType = {
			NONE:   0,
			BODY_A: 1,
			BODY_B: 2,
			BOTH:   3
		}

		switch (bodiesWithPreviousIntersections) {
			case PreviousIntersectionType.NONE:
				const intersection = [bodyA, bodyB],
					index = this.intersections.length

				bodyA.contact = index
				bodyB.contact = index

				this.intersections.push(intersection)
				break
			case PreviousIntersectionType.BODY_A:
				bodyB.contact = bodyA.contact
				this.intersections[bodyA.contact].push(bodyB)
				break
			case PreviousIntersectionType.BODY_B:
				bodyA.contact = bodyB.contact
				this.intersections[bodyB.contact].push(bodyA)
				break
			case PreviousIntersectionType.BOTH:
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

					bodyA.position.x = getWeightedAverage(bodyA.position.x, bodyA.mass, bodyB.position.x, bodyB.mass)
					bodyA.position.y = getWeightedAverage(bodyA.position.y, bodyA.mass, bodyB.position.y, bodyB.mass)

					bodyA.velocity.x = getWeightedAverage(bodyA.velocity.x, bodyA.mass, bodyB.velocity.x, bodyB.mass)
					bodyA.velocity.y = getWeightedAverage(bodyA.velocity.y, bodyA.mass, bodyB.velocity.y, bodyB.mass)

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