// following function was used to simulate gravity constraint between two bodies before barnes-hut implementation in physicsworld.js

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