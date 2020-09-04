class Intersection {
	constructor () {
		this.intersections = []
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
				if (bodyA.contact !== bodyB.contact) { // no need to do anything if they're already in the same intersection
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
}