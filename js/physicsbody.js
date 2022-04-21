export default class PhysicsBody {
	#destroyed = false
	constructor (position, velocity, shape) {
		this.position = position
		this.pastPosition = position.copy()
		this.velocity = velocity
		this.acceleration = null
		this.shape = shape
		this.density = 1
		this.contact = null
		this.collidable = true

		this.userData = {}
	}
	get mass () {
		return this.shape.volume * this.density
	}
	set mass (kg) {
		this.density = kg / this.shape.volume // _volume???
	}
	get destroyed () {
		return this.#destroyed
	}
	destroy () {
		this.#destroyed = true
	}
}