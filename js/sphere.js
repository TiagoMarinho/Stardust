class Sphere extends Shape {
	constructor (radius) {
		super()
		
		this._radius = null
		this._volume = null
		this._area = null

		this.radius = radius
	}
	get radius () {
		return this._radius
	}
	set radius (meters) {
		this._radius = meters
		this._volume = 4 / 3 * Math.PI * (meters * meters * meters)
		this._area = 4 * Math.PI * (meters * meters)
	}
	get area () {
		return this._area
	}
	get volume () {
		return this._volume
	}
	set volume (cubicMeters) {
		this._radius = Math.cbrt(cubicMeters * 3 / (4 * Math.PI))
		this._volume = cubicMeters
		this._area = 4 * Math.PI * (this._radius * this._radius)
	}
}