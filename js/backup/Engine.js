var SDU = SDU || {};
SDU.GameScene = function(canvas) {
	this.canvas = document.getElementById(canvas);
	this.ctx = this.canvas.getContext("2d");
	this.SDUScene_constructor(canvas);
	this.mouseMoveOutside = true;
	this.bodies = [];
	this.collisions = [];
	this.garbage = [];
	this.palette = {
		dark: ["#FF4650", "#FFD939", "#97FB32", "#32CEF4", "#FE60D6"],
		light: ["#CF7758", "#9FB6A3", "#A878A6", "#7D8FA6", "#B04C56", "#3D4754", "#3D4754"]
	};
	this.trail = new createjs.Shape();
	this.trail.cache(0, 0, window.innerWidth, window.innerHeight);
	this.addChildAt(this.trail);
	SDU.GameScene.self = this;

	this.collisionSound = document.getElementById("cs");
	this.setup();
	this.listen();
};
createjs.extend(SDU.GameScene, SDU.Scene);
SDU.GameScene.prototype.nextPlanetRadius = 5;
SDU.GameScene.prototype.pastTickStart = performance.now();
SDU.GameScene.prototype.gcIterations = 0;
SDU.GameScene.prototype.delta = 0;
SDU.GameScene.prototype.config = {};
SDU.GameScene.prototype.getMass = function() {
	var mass = 0;
	for (var i = 0; i < this.bodies.length; ++i) {
		var obj = this.bodies[i];
		mass += obj.getMass();
	}
	return mass;
};
SDU.GameScene.prototype.setup = function() {
	for (var i = 0; i < 100; ++i) {
		var x = utils.getRandomInt(0, window.innerWidth),
			y = utils.getRandomInt(0, window.innerHeight),
			radius = 5,
			color = utils.getRandomItem(this.palette.light);
		var planet = new SDU.Planet(x, y, radius, color);
		this.addChildAt(planet, this.numChildren);
		this.bodies.push(planet);
	}
};
SDU.GameScene.prototype.step = function() {
	var obj, obj1, obj2, obj3,
		i, i1, i2, i3, i4;
	for (i = 0; i < this.bodies.length; ++i) {
		obj = this.bodies[i];
		if (obj.movable) {
			obj.px = obj.x;
			obj.py = obj.y;
			obj.x += obj.vx / 333;
			obj.y += obj.vy / 333;

			this.trail.graphics.s("#E0E3ED").ss(1, "square").mt(obj.px, obj.py).lt(obj.x, obj.y);
		}
	}
	this.trail.updateCache("source-overlay");
	this.trail.graphics.clear();
	this.gcIterations = 0;
	for (i1 = 0; i1 < this.bodies.length - 1; ++i1) {
		obj1 = this.bodies[i1];
		for (i2 = i1 + 1; i2 < this.bodies.length; ++i2) {
			obj2 = this.bodies[i2];
			++this.gcIterations;

			var diffX = obj2.x - obj1.x,
				diffY = obj2.y - obj1.y,
				distSquare, dist;

			if (1000 / this.delta < 50)
				distSquare = diffX * diffX + diffY * diffY;
			else distSquare = Math.min(utils.distToSegmentSquared(obj2, {
				x: obj1.px,
				y: obj1.py
			}, obj1), utils.distToSegmentSquared(obj1, {
				x: obj2.px,
				y: obj2.py
			}, obj2));

			if (distSquare > (obj1.radius + obj2.radius) * (obj1.radius + obj2.radius)) {
				dist = Math.sqrt(distSquare);

				if (obj1.affectedByGravity) {
					var force1 = obj2.mass / distSquare * obj2.attraction;
					obj1.vx += force1 * diffX / dist;
					obj1.vy += force1 * diffY / dist;
				}
				if (obj2.affectedByGravity) {
					var force2 = obj1.mass / distSquare * obj1.attraction;
					obj2.vx -= force2 * diffX / dist;
					obj2.vy -= force2 * diffY / dist;
				}
			} else if (obj1.collidable && obj2.collidable) {
				var alreadyHadCollisions = false,
					collisionIndex = -1;
				i3 = this.collisions.length;
				while (i3--) {
					var collision = this.collisions[i3],
						index1 = collision.indexOf(obj1),
						index2 = collision.indexOf(obj2);

					if (index1 > -1 && index2 === -1)
						collision.push(obj2);
					else if (index1 === -1 && index2 > -1)
						collision.push(obj1);

					// Following code is a fix for [[obj1, obj3], [obj2, obj4]].
					if (alreadyHadCollisions && (index1 > -1 || index2 > -1)) {
						for (i4 = 0; i4 < this.collisions[collisionIndex].length; ++i4) {
							obj3 = this.collisions[collisionIndex][i4];
							if (obj3 !== obj1 && obj3 !== obj2) collision.push(obj3);
						}
						this.collisions.splice(collisionIndex, 1);
					}

					if (index1 > -1 || index2 > -1) {
						alreadyHadCollisions = true;
						collisionIndex = i3;
					}
				}
				if (!alreadyHadCollisions) this.collisions.push([obj1, obj2]);
			}
		}
	}
	for (i1 = 0; i1 < this.collisions.length; ++i1) {
		var targets = this.collisions[i1],
			biggestRadius, scaleFactor;
		obj1 = targets[0];
		biggestRadius = obj1.getRadius();
		for (i2 = 1; i2 < targets.length; ++i2) {
			obj2 = targets[i2];
			var density = Math.max(obj1.density, obj2.density),
				area = obj1.getArea() * (obj1.density / density) + obj2.getArea() * (obj2.density / density);

			obj1.x = (obj1.getMass() * obj1.x + obj2.getMass() * obj2.x) / (obj1.getMass() + obj2.getMass());
			obj1.y = (obj1.getMass() * obj1.y + obj2.getMass() * obj2.y) / (obj1.getMass() + obj2.getMass());
			obj1.px = obj1.x;
			obj1.py = obj1.y;
			obj1.vx = (obj1.getMass() * obj1.vx + obj2.getMass() * obj2.vx) / (obj1.getMass() + obj2.getMass());
			obj1.vy = (obj1.getMass() * obj1.vy + obj2.getMass() * obj2.vy) / (obj1.getMass() + obj2.getMass());

			obj1.setArea(area); // Setting obj1's area must happen after calculating velocity!
			if (Math.abs(obj1.getRadius() - obj2.getRadius()) < 33) obj1.setColor(utils.getRandomItem(this.palette.light));
			biggestRadius = Math.max(obj2.getRadius(), biggestRadius);
			obj1.attraction = Math.max(obj1.attraction, obj2.attraction);

			this.garbage.push(obj2);
		}
		obj1.redraw();
		if (1000 / this.delta >= 30) {
			scaleFactor = biggestRadius / obj1.getRadius();
			obj1.scaleX = obj1.scaleY = scaleFactor;
			createjs.Tween.get(obj1, {
				override: true
			}).to({
				scaleX: 1,
				scaleY: 1
			}, 1000, createjs.Ease.elasticOut);
		}
	}
	this.collisions.length = 0;
	for (i = 0; i < this.garbage.length; ++i) {
		obj = this.garbage[i];

		var index = this.bodies.indexOf(obj);
		if (index > -1)
			this.bodies.splice(index, 1);
		else throw new Error("Tried to dump unexistent object from `bodies` array. " + obj);

		if (obj.parent && obj.parent.getChildIndex(obj) > -1) obj.parent.removeChild(obj);
		obj = null;
	}
	this.garbage.length = 0;
};
SDU.GameScene.prototype.listen = function() {
	var self = this,
		arrows = [],
		preview = new SDU.Planet(0, 0, self.nextPlanetRadius, null, {
			visible: false
		});
	preview.setStroke("#3D4754", 3);
	self.addChildAt(preview, self.numChildren);

	for (i = 0; i < 3; ++i) {
		arrows[i] = new SDU.Arrow(0, 0, 5, 10, "#3D4754", 3, {}, self);
		arrows[i].visible = false;
	}

	self.mouse.down = false;
	createjs.Touch.enable(this);
	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.addEventListener("tick", function() {
		self.delta = performance.now() - self.pastTickStart;
		self.pastTickStart = performance.now();
		self.step();
		self.update();
		_listenMouseMove();
		swirl(self.ctx, 500, 400, 100, 2, 0);
	});
	self.addEventListener("stagemousedown", function(e) {
		self.mouse.down = {
			x: e.stageX,
			y: e.stageY
		};
		preview.redraw();
		preview.visible = true;
		preview.x = self.mouse.down.x;
		preview.y = self.mouse.down.y;
	});

	function _listenMouseMove() {
		obj = null;
		if (self.mouse.down) {
			var diffX = self.mouse.x - self.mouse.down.x,
				diffY = self.mouse.y - self.mouse.down.y,
				distSquare = diffX * diffX + diffY * diffY;

			var radius = self.nextPlanetRadius,
				padding = 5,
				length = 10,
				angle = Math.atan2(self.mouse.y - self.mouse.down.y, self.mouse.x - self.mouse.down.x);

			for (i = 0; i < 3; ++i) {
				arrows[i].set({
					x: (radius + padding * (i + 1) + length * i) * Math.cos(angle) + self.mouse.down.x,
					y: (radius + padding * (i + 1) + length * i) * Math.sin(angle) + self.mouse.down.y,
					rotation: angle / Math.PI * 180 + 90,
					visible: distSquare > utils.sqr(radius + padding * (i + 2) + length * (i + 1))
				});
			}
		} else preview.set({
			x: self.mouse.x,
			y: self.mouse.y
		});
	}
	self.addEventListener("stagemouseup", function(e) {
		preview.visible = false;

		for (i = 0; i < 3; ++i) {
			arrows[i].visible = false;
		}
		var diffX = e.stageX - self.mouse.down.x,
			diffY = e.stageY - self.mouse.down.y,
			distSquare = diffX * diffX + diffY * diffY,
			dist = Math.sqrt(distSquare),
			angle = Math.atan2(e.stageY - self.mouse.down.y, e.stageX - self.mouse.down.x);

		var planet = new SDU.Planet(self.mouse.down.x, self.mouse.down.y, self.nextPlanetRadius, utils.getRandomItem(self.palette.light), {
			vx: dist * 2 * Math.cos(angle),
			vy: dist * 2 * Math.sin(angle)
		});
		self.addChildAt(planet, self.numChildren);
		self.bodies.push(planet);
		planet.scaleX = planet.scaleY = 0;
		createjs.Tween.get(planet, {
			override: true
		}).to({
			scaleX: 1,
			scaleY: 1
		}, 1000, createjs.Ease.elasticOut);
		self.mouse.down = false;
	});
	$(window).on("scroll", function() {
		var maxScroll = window.innerHeight / 100 * 200 - window.innerHeight;
		var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
		self.nextPlanetRadius = Math.min(Math.max(currentScroll / maxScroll * 15 + 5, 2.5), 50);
		var scaleFactor = preview.getRadius() / self.nextPlanetRadius;
		preview.setRadius(self.nextPlanetRadius);
		preview.redraw();
		preview.scaleX = preview.scaleY = scaleFactor;
		if (self.mouse.x !== null && self.mouse.y !== null) preview.visible = true;
		if (!self.mouse.down)
			preview.set({
				x: self.mouse.x,
				y: self.mouse.y
			});
		createjs.Tween.get(preview, {
			override: true
		}).to({
			scaleX: 1,
			scaleY: 1
		}, 1000, createjs.Ease.elasticOut).call(function() {
			//if (!self.mouse.down) preview.visible = false;
		});
	});
};
createjs.promote(SDU.GameScene, "SDUScene");