export default class Entity {
	constructor (graphics, physicsBody) {
		this.graphics = graphics
		this.physicsBody = physicsBody
	}
	update () {
		this.graphics.active = !this.physicsBody.destroyed
		this.graphics.position = this.physicsBody.position
	}
}