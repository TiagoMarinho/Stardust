class PhysicsBody {
	constructor (position, velocity, shape) {
		this.position = position
		this.pastPosition = position.copy()
		this.velocity = velocity
		this.acceleration = null
		this.shape = shape
		this.density = 1
		this.contact = null
		this._destroyed = false
		this.collidable = true

		this.userData = {}
	}
	get mass () {
		return this.shape.volume * this.density
	}
	set mass (kg) {
		this.density = kg / this._volume 
	}
	get destroyed () {
		return this._destroyed
	}
	destroy () {
		this._destroyed = true
	}
}