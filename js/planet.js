import Entity from "./entity.js"
import Sphere from "./sphere.js"
import Graphics from "./graphics.js"
import PhysicsBody from "./physicsbody.js"
import Vector from "./vector.js"

export default class Planet extends Entity {
	constructor (color, position, radius) {
		const shape = new Sphere(radius),
			graphics = new Graphics(color, position, shape),
			physicsBody = new PhysicsBody(position, new Vector(0, 0), shape)

		super(graphics, physicsBody)
	}
}