var Star = function(canvas, bgCanvas) {
	this.canvas = document.getElementById(canvas);
	this.context = this.canvas.getContext("2d");
	this.stage = new createjs.Stage(this.canvas);
	this.scene = new createjs.Container();

	this.bgCanvas = document.getElementById(bgCanvas);
	this.bgContext = this.bgCanvas.getContext("2d");
	this.bgStage = new createjs.Stage(this.bgCanvas);
	this.bgScene = new createjs.Container();

	this.route = new createjs.Shape();
	this.bodies = [];
	this.bodiesToRemove = [];
	this.palette = ["#ff616a", "#ffd214", "#25e582", "#49cfef", "#ba75e9"];

	this.init = (function(_this) {
		Star.self = _this;
		_this.stage.mouseMoveOutside = true;
		_this.stage.addChild(_this.scene);
		_this.bgStage.addChild(_this.bgScene);
		_this.route.cache(0, 0, window.innerWidth, window.innerHeight);
		_this.bgScene.addChild(_this.route);
	})(this);
}; // TODO: Add comets and asteroids that come from offscreen.
Star.prototype.paused = false;
Star.prototype.run = function() {
	this.listen();
	this.preTick(0);
};
Star.prototype.preTick = function(iterations) {
	if (!Star.self.paused) {
		++iterations;
		Star.self.tick(iterations);
	}
	Star.self.stage.update();
	Star.self.bgStage.update();
	requestAnimationFrame(function() {
		Star.self.preTick(iterations);
	});
};
Star.prototype.tick = function(iterations) {
	var _this = this;

	this.bodies.forEach(function(obj) {
		if (obj.shape.movable) {
			obj.shape.px = obj.shape.x;
			obj.shape.py = obj.shape.y;
			obj.shape.x += obj.shape.vx / 100;
			obj.shape.y += obj.shape.vy / 100;

			if (obj.shape.drawRoute) {
				_this.route.graphics.s("rgb(62, 76, 92)").ss(Math.min(obj.shape.radius, 5), "round").mt(obj.shape.px, obj.shape.py).lt(obj.shape.x, obj.shape.y);
				_this.route.updateCache("source-overlay");
				_this.route.graphics.clear();
			}
		}
	});

	this.bodies.forEach(function(obj1) {
		_this.bodies.forEach(function(obj2) {
			if (obj1 !== obj2 &&
				_this.bodiesToRemove.indexOf(obj1) < 0 &&
				_this.bodiesToRemove.indexOf(obj2) < 0) {

				var diffX = obj2.shape.x - obj1.shape.x,
					diffY = obj2.shape.y - obj1.shape.y;
				var distSquare = diffX * diffX + diffY * diffY;
				var dist = Math.sqrt(distSquare);

				if (dist > obj1.shape.radius + obj2.shape.radius) {
					if (obj1.shape.affectedByGravity && obj2.shape.affectedByGravity) {
						var TOTAL_FORCE = (obj2.shape.getMass()) / distSquare;
						obj1.shape.vx += TOTAL_FORCE * diffX / dist;
						obj1.shape.vy += TOTAL_FORCE * diffY / dist;
					}
				} else if (obj1.shape.collidable && obj2.shape.collidable) {
					var MASS_CENTER_X = (obj1.shape.getMass() * obj1.shape.x + obj2.shape.getMass() * obj2.shape.x) / (obj1.shape.getMass() + obj2.shape.getMass()),
						MASS_CENTER_Y = (obj1.shape.getMass() * obj1.shape.y + obj2.shape.getMass() * obj2.shape.y) / (obj1.shape.getMass() + obj2.shape.getMass());


					var COLLISION_POINT_X = (obj1.shape.x * obj2.shape.radius + obj2.shape.x * obj1.shape.radius) / (obj1.shape.radius + obj2.shape.radius),
						COLLISION_POINT_Y = (obj1.shape.y * obj2.shape.radius + obj2.shape.y * obj1.shape.radius) / (obj1.shape.radius + obj2.shape.radius);

					var OBJ3_VX = (obj1.shape.getMass() * obj1.shape.vx + obj2.shape.getMass() * obj2.shape.vx) / (obj1.shape.getMass() + obj2.shape.getMass());
					var OBJ3_VY = (obj1.shape.getMass() * obj1.shape.vy + obj2.shape.getMass() * obj2.shape.vy) / (obj1.shape.getMass() + obj2.shape.getMass());

					var OBJ3_RADIUS = obj1.shape.radius + obj2.shape.radius,
						GREATEST_RADIUS = Math.max(obj1.shape.radius, obj2.shape.radius),
						LOWEST_RADIUS = Math.min(obj1.shape.radius, obj2.shape.radius),
						RELATIVE_SCALE = GREATEST_RADIUS / OBJ3_RADIUS;

					var OBJ3_COLOR = Star.self.palette[utils.getRandomInt(0, Star.self.palette.length - 1)],
						OBJ3_DENSITY = utils.getAverage(obj1.shape.density, obj2.shape.density);

					var obj3 = new Planet(_this, MASS_CENTER_X, MASS_CENTER_Y, OBJ3_RADIUS, OBJ3_COLOR, OBJ3_DENSITY, _this.scene, {
						vx: OBJ3_VX,
						vy: OBJ3_VY,
						scaleX: RELATIVE_SCALE,
						scaleY: RELATIVE_SCALE
					});
					_this.bodies.push(obj3);

					for (var i = 0; i < LOWEST_RADIUS * 2; i++) {
						var DUST_COLOR = Star.self.palette[utils.getRandomInt(0, Star.self.palette.length - 1)];
						var dust = new Planet(_this, COLLISION_POINT_X, COLLISION_POINT_Y, 1, DUST_COLOR, OBJ3_DENSITY, _this.scene, {
							vx: utils.getRandomInt(-100, 100) + OBJ3_VX,
							vy: utils.getRandomInt(-100, 100) + OBJ3_VY,
							collidable: false,
							drawRoute: false
						});
						_this.bodies.push(dust);
						(function(obj){
							setTimeout(function(){
							createjs.Tween.get(obj.shape, {override: true}).to({scaleX: 0}, 500).call(function(){
								_this.bodiesToRemove.push(obj);
							});
						}, utils.getRandomInt(5000, 25000));
						})(dust);
					}

					_this.bodiesToRemove.push(obj1, obj2);
				}
			}
		});
	});

	this.bodiesToRemove.forEach(function(obj) {
		obj.shape.collidable = false;

		if (_this.bodies.indexOf(obj) > -1) {
			_this.bodies.splice(_this.bodies.indexOf(obj), 1);
		}
		_this.scene.removeChild(obj.shape);
		if (_this.bodiesToRemove.indexOf(obj) > -1) {
			_this.bodiesToRemove.splice(_this.bodiesToRemove.indexOf(obj), 1);
		}
	});
};
Star.prototype.listen = function() {
	var mouse = {
		x: 0,
		y: 0,
		size: 5
	};
	this.stage.on("stagemousedown", function(e) {
		mouse.x = e.stageX;
		mouse.y = e.stageY;

		var ss = 2;
		var sizeMarker = new createjs.Shape();
		sizeMarker.graphics.s("rgb(62, 76, 92)").ss(ss).dc(0, 0, mouse.size);
		sizeMarker.set({x: mouse.x, y: mouse.y});
		sizeMarker.compositeOperation = "lighter";
		sizeMarker.cache(-mouse.size - ss, -mouse.size - ss, mouse.size*2 + ss*2, mouse.size*2 + ss*2);
		sizeMarker.graphics.clear();
		Star.self.bgScene.addChild(sizeMarker);
		createjs.Tween.get(sizeMarker).wait(2500).to({alpha: 0}, 1000).call(function(){
			Star.self.bgScene.removeChild(sizeMarker);
		});
	});
	this.stage.on("stagemousemove", function(e) {});
	this.stage.on("stagemouseup", function(e) {
		var PLANET_COLOR = Star.self.palette[utils.getRandomInt(0, Star.self.palette.length - 1)],
			PLANET_VX = (e.stageX - mouse.x),
			PLANET_VY = (e.stageY - mouse.y);
		var DENSITY = (key.isDown(key.SHIFT)) ? 1000 : 1.5;
		var planet = new Planet(Star.self, mouse.x, mouse.y, 5, PLANET_COLOR, DENSITY, Star.self.scene, {
			vx: PLANET_VX,
			vy: PLANET_VY
		});
		Star.self.bodies.push(planet);
	});
	window.addEventListener("keydown", function(e) {
		if (e.keyCode === key.SPACE_BAR) {
			Star.self.paused = !Star.self.paused;
		}
	});
};
