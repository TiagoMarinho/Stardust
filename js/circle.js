class Circle extends Shape {
	#radius
	#area
	constructor (radius) {
		super()
		
		this.#radius = radius
		this.#area = Math.PI * this.radius * this.radius
	}
}