class Intersection {
	constructor () {
		this.intersections = []
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

		// this could be easily moved to intersection.js
		// while this is not done I'll have this code heavily commented

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
}