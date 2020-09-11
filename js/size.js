class Size {
	constructor (width, height) {
		this.width = width
		this.height = height
		//Pre-calculate this
		this.squareWidth = width * width; 
		this.squareHeight = height * height;
	}
}