var SDU = SDU || {};

SDU.Planet = function(x, y, radius, color, properties, parent) {
	this.createjsShape_constructor();
	this.set({
		x: x,
		y: y,
		radius: radius,
		color: color,
		stroke: {
			color: null,
			thickness: 0
		},

		vx: 0,
		vy: 0,
		px: x,
		py: y,

		density: 1,
		attraction: 1,

		movable: true,
		collidable: true,
		affectedByGravity: true,

		redraw: function() {
			var radius = this.radius + this.stroke.thickness;
			this.graphics.s(this.stroke.color).ss(this.stroke.thickness).f(this.color).dc(0, 0, this.radius);
			this.cache(-radius, -radius, radius * 2, radius * 2);
			this.graphics.clear();
		},
		getMass: function() {
			return this.getArea() * this.density;
		},
		setMass: function(newValue, changeArea) {
			if (!changeArea) {
				this.density = newValue / this.getArea();
			} else {
				this.setArea(newValue / this.density);
			}
		},
		getArea: function() {
			return Math.PI * this.radius * this.radius;
		},
		setArea: function(newValue) {
			this.radius = Math.sqrt(newValue / Math.PI);
		},
		getRadius: function() {
			return this.radius;
		},
		setRadius: function(newValue, conformDensity) {
			if (conformDensity)
				this.density = this.radius / newValue;
			this.radius = newValue;
		},
		getColor: function() {
			return this.color;
		},
		setColor: function(newValue) {
			this.color = newValue;
		},
		setStroke: function(color, thickness) {
			this.stroke.color = color;
			this.stroke.thickness = thickness;
		}
	}).set(properties || {});
	this.redraw();
	if (parent) parent.addChild(this);
};
createjs.extend(SDU.Planet, createjs.Shape);
createjs.promote(SDU.Planet, "createjsShape");