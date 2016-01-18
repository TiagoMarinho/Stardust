var SDU = SDU || {};

SDU.Planet = function(x, y, radius, color, properties) {
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
		area: Math.PI * radius * radius,

		movable: true,
		collidable: true,
		affectedByGravity: true,

		redraw: function(res) {
			var radius = this.radius + this.stroke.thickness;
			this.graphics.s(this.stroke.color).ss(this.stroke.thickness).f(this.color).dc(0, 0, this.radius);
			this.cache(-radius, -radius, radius * 2, radius * 2, res || 1);
			this.graphics.clear();
		},
		getDensity: function() {
			return this.density;
		},
		setDensity: function(newValue) {
			this.density = newValue;
			this.mass = this.area * this.density;
		},
		getMass: function() {
			return this.mass;
		},
		setMass: function(newValue, conformArea) {
			if (!conformArea)
				this.setDensity(newValue / this.area);
			else
				this.setArea(newValue / this.density);
			this.mass = newValue;
		},
		getArea: function() {
			return this.area;
		},
		setArea: function(newValue, conformDensity) {
			if (conformDensity)
				this.density *= this.area / newValue;
			this.area = newValue;
			this.radius = Math.sqrt(newValue / Math.PI);
			this.mass = this.area * this.density;
		},
		getRadius: function() {
			return this.radius;
		},
		setRadius: function(newValue, conformDensity) {
			if (conformDensity)
				this.density *= this.radius / newValue;
			this.radius = newValue;
			this.area = 4 * Math.PI * newValue * newValue;
			this.mass = this.area * this.density;
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
		},
		getStroke: function() {
			return this.stroke.color;
		}
	}).set(properties || {});
	this.setBounds(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
	this.mass = this.area * this.density;
	this.redraw();
};
createjs.extend(SDU.Planet, createjs.Shape);
createjs.promote(SDU.Planet, "createjsShape");