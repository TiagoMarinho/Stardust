//"use strict";
class Planet extends createjs.Shape {
	constructor(x, y, radius, color) {
		super();
		this.graphics.f(color).dc(0, 0, radius);
		this.cache(-radius, -radius, radius * 2, radius * 2);
		this.set({
			x, y, color,
			density: 1,
			vx: 0, vy: 0,
			collidable: true
		});
		this.radius = radius;
	}
	get radius() {
		return this._radius;
	}
	set radius(newValue) {
		this._radius = newValue;
		this._area = 4 * Math.PI * newValue * newValue;
		this._mass = this._area * this.density;
	}
	get area() {
		return this._area;
	}
	set area(newValue) {
		this._area = newValue;
		this._radius = Math.sqrt(newValue / Math.PI / 4);
		this._mass = this.area * this.density;
	}
	get mass() {
		return this._mass;
	}
	set mass(newValue) {
		this._mass = newValue;
		this.density = newValue / this.area;
	}
	redraw(margin, resolution) {
		margin = margin || 10 * this.radius;
		resolution = resolution || 1;
		var r = this._radius;
		this.graphics.clear();
		this.graphics.f(this.color).dc(0, 0, r);
		//this.graphics.ef().s("#0F0").dr(-r, -r, r * 2, r * 2);
		this.cache(-r - margin, -r - margin, r * 2 + margin * 2, r * 2 + margin * 2, resolution);
	}
}
