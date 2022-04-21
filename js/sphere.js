import Shape from "./shape.js"

export default class Sphere extends Shape {
		
	#radius = null
	#volume = null
	#area = null

	constructor (radius) {
		super()

		this.radius = radius
	}
	get radius () {
		return this.#radius
	}
	set radius (meters) {
		this.#radius = meters
		this.#volume = 4 / 3 * Math.PI * (meters * meters * meters)
		this.#area = 4 * Math.PI * (meters * meters)
	}
	get area () {
		return this.#area
	}
	get volume () {
		return this.#volume
	}
	set volume (cubicMeters) {
		this.#radius = Math.cbrt(cubicMeters * 3 / (4 * Math.PI))
		this.#volume = cubicMeters
		this.#area = 4 * Math.PI * (this.#radius * this.#radius)
	}
}