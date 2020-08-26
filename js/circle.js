class Circle extends Shape {
	constructor (radius) {
		super()
		
		this._radius = radius
		this._area = Math.PI * this.radius * this.radius
	}
}