var massCenterX = (obj1.physicsBody.getMass() * obj1.physicsBody.x + obj2.physicsBody.getMass() * obj2.physicsBody.x) / (obj1.physicsBody.getMass() + obj2.physicsBody.getMass()),
	massCenterY = (obj1.physicsBody.getMass() * obj1.physicsBody.y + obj2.physicsBody.getMass() * obj2.physicsBody.y) / (obj1.physicsBody.getMass() + obj2.physicsBody.getMass());

var collisionPointX = (obj1.physicsBody.x * obj2.physicsBody.radius + obj2.physicsBody.x * obj1.physicsBody.radius) / (obj1.physicsBody.radius + obj2.physicsBody.radius),
	collisionPointY = (obj1.physicsBody.y * obj2.physicsBody.radius + obj2.physicsBody.y * obj1.physicsBody.radius) / (obj1.physicsBody.radius + obj2.physicsBody.radius);

var biggestRadius = Math.max(obj1.physicsBody.radius, obj2.physicsBody.radius),
	biggestObj = obj1.physicsBody.radius > obj2.physicsBody.radius ? obj1 : (obj1.physicsBody.radius < obj2.physicsBody.radius) ? obj2 : null,
	biggestDensity = Math.max(obj1.physicsBody.density, obj2.physicsBody.density);

var isBlackHole = biggestDensity === 500,
	color = isBlackHole ? "#000810" : this.palette.getRandomItem(),
	shadow = isBlackHole ? new createjs.Shadow("rgba(255, 255, 255, 0.25)", 0, 0, 5) : null;

var area = obj1.physicsBody.getArea() * (obj1.physicsBody.density / biggestDensity) + obj2.physicsBody.getArea() * (obj2.physicsBody.density / biggestDensity),
	radius = Math.sqrt(area / Math.PI),
	vx = (obj1.physicsBody.getMass() * obj1.physicsBody.vx + obj2.physicsBody.getMass() * obj2.physicsBody.vx) / (obj1.physicsBody.getMass() + obj2.physicsBody.getMass()),
	vy = (obj1.physicsBody.getMass() * obj1.physicsBody.vy + obj2.physicsBody.getMass() * obj2.physicsBody.vy) / (obj1.physicsBody.getMass() + obj2.physicsBody.getMass());

// FIXME: leaving obj1 and obj2 to check for remaining collisions wont work, they'll generate two obj3s if there are three objs colliding, and they'll sum up, resulting on erroneous mass!

var obj3 = new Planet(this, massCenterX, massCenterY, radius, color, {
	name: biggestObj ? biggestObj.physicsBody.name : this.planetNames.getRandomItem(),
	vx: vx,
	vy: vy,
	scaleX: biggestRadius / radius,
	scaleY: biggestRadius / radius,

	density: biggestDensity,
	movable: (obj1.physicsBody.movable && obj2.physicsBody.movable),

	ancestors: [obj1, obj2],

	shadow: shadow
}, this.scene, 1.3);
this.physicsBodies.push(obj3);
createjs.Tween.get(obj3.physicsBody, {
	override: true
}).to({
	scaleX: 1,
	scaleY: 1
}, 1000, createjs.Ease.elasticOut);

if (this.selectedObj === obj1 || this.selectedObj === obj2) {
	this.selectedObj = obj3;
}

this.trashQueue.push(obj1, obj2);
obj1.physicsBody.collidable = obj2.physicsBody.collidable = false;