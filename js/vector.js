export default class Vector {
	constructor (x, y) {
		this.x = x
		this.y = y
	}

	get length () {
		return Math.sqrt(this.lengthSquare) // cache for best performance
	}

	get lengthSquare () {
		return Vector.dotProduct(this)
	}

	normalize () {
		return Vector.divide(this, this.length)
	}

	copy () {
		return new Vector(this.x, this.y)
	}

	static add (vector, vectorOrScalar) {
		if (!Vector.isVector(vectorOrScalar))
			return new Vector(
				vector.x + vectorOrScalar, 
				vector.y + vectorOrScalar
			)

		return new Vector(
			vector.x + vectorOrScalar.x, 
			vector.y + vectorOrScalar.y
		)
	}

	static subtract (vector, vectorOrScalar) {
		if (!Vector.isVector(vectorOrScalar))
			return new Vector(
				vector.x - vectorOrScalar, 
				vector.y - vectorOrScalar
			)

		return new Vector(
			vector.x - vectorOrScalar.x, 
			vector.y - vectorOrScalar.y
		)
	}

	static divide (vector, vectorOrScalar) {
		if (!Vector.isVector(vectorOrScalar))
			return new Vector(
				vector.x / vectorOrScalar, 
				vector.y / vectorOrScalar
			)

		return new Vector(
			vector.x / vectorOrScalar.x, 
			vector.y / vectorOrScalar.y
		)
	}

	static multiply (vector, vectorOrScalar) {
		if (!Vector.isVector(vectorOrScalar))
			return new Vector(
				vector.x * vectorOrScalar, 
				vector.y * vectorOrScalar
			)

		return new Vector(
			vector.x * vectorOrScalar.x, 
			vector.y * vectorOrScalar.y
		)
	}

	static dotProduct (vector) {
		return this.x * vector.x + this.y * vector.y
	}
	
	static isVector (value) {
		return value.constructor === Vector
	}
}