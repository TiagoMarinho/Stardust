export default class Size {
	constructor (width, height) {
		this.width = width
		this.height = height
		
		this.squareWidth = width * width
		this.squareHeight = height * height
	}
}