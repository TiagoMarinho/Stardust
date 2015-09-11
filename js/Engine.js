var SDU = SDU || {};
SDU.GameScene = function(canvas) {
	this.canvas = document.getElementById(canvas);
	this.SDUScene_constructor(canvas);
	this.bodies = [];
	this.collisions = [];
	this.garbage = [];
	this.palette = {
		dark: ["#FF4650", "#FFD939", "#97FB32", "#32CEF4", "#FE60D6"],
		light: ["#CF7758", "#9FB6A3", "#A878A6", "#7D8FA6", "#B04C56", "#3D4754", "#3D4754"]
	};
	SDU.GameScene.self = this;

	this.setup();
	this.listen();
};
createjs.extend(SDU.GameScene, SDU.Scene);
SDU.GameScene.prototype.setup = function() {
	/*for (var i1 = 0; i1 < 10; ++i1) {
		for (var i2 = 0; i2 < 10; ++i2) {
			var planet = new SDU.Planet(50 + i1 * 25, 50 + i2 * 25, 5, this.palette.light.getRandomItem(), {
				density: 1,
				attraction: 1
			}, this);
		}
	}*/
	for (var i = 0; i < 500; ++i) {
		var planet = new SDU.Planet(utils.getRandomInt(0, window.innerWidth), utils.getRandomInt(0, window.innerHeight), 5, this.palette.light.getRandomItem(), {}, this);
	}

	//var p1 = new SDU.Planet(50, 50, 5, this.palette.getRandomItem(), {}, this);
	//var p2 = new SDU.Planet(100, 50, 10, this.palette.getRandomItem(), {}, this);
};
SDU.GameScene.prototype.pastTickStart = performance.now();
SDU.GameScene.prototype.gcIterations = 0;
SDU.GameScene.prototype.delta = 0;
SDU.GameScene.prototype.listen = function() {
	var _this = this,
		preview;
	_this.mouse.down = false;
	createjs.Touch.enable(this);
	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.addEventListener("tick", function() {
		_this.delta = performance.now() - _this.pastTickStart;
		_this.pastTickStart = performance.now();
		_this.step();
		_this.update();
		_listenMouseMove();
	});
	_this.addEventListener("stagemousedown", function(e) {
		_this.mouse.down = {
			x: e.stageX,
			y: e.stageY
		};
		preview = new SDU.Planet(_this.mouse.down.x, _this.mouse.down.y, 5, null, {
			movable: false,
			collidable: false,
			attraction: 0
		}, _this);
		preview.setStroke("#3D4754", 2);
		preview.redraw();
	});

	function _listenMouseMove() {
		if (_this.mouse.down) {}
	}
	_this.addEventListener("stagemouseup", function(e) {
		if (preview) _this.garbage.push(preview);
		var diffX = e.stageX - _this.mouse.down.x,
			diffY = e.stageY - _this.mouse.down.y,
			distSquare = diffX * diffX + diffY * diffY,
			dist = Math.sqrt(distSquare),
			angle = Math.atan2(e.stageY - _this.mouse.down.y, e.stageX - _this.mouse.down.x);

		var planet = new SDU.Planet(_this.mouse.down.x, _this.mouse.down.y, 5, _this.palette.light.getRandomItem(), {
			vx: dist * 2 * Math.cos(angle),
			vy: dist * 2 * Math.sin(angle)
		}, _this);
		planet.scaleX = planet.scaleY = 0;
		createjs.Tween.get(planet, {
			override: true
		}).to({
			scaleX: 1,
			scaleY: 1
		}, 1000, createjs.Ease.elasticOut);
		_this.mouse.down = false;
	});
};
SDU.GameScene.prototype.step = function() {
	var obj, obj1, obj2, obj3,
		i, i1, i2, i3, i4;
	for (i = 0; i < this.bodies.length; ++i) {
		obj = this.bodies[i];
		if (obj.movable) {
			obj.px = obj.x;
			obj.py = obj.y;
			obj.x += obj.vx / 500;
			obj.y += obj.vy / 500;
		}
	}
	this.gcIterations = 0;
	for (i1 = 0; i1 < this.bodies.length; ++i1) {
		obj1 = this.bodies[i1];
		for (i2 = i1 + 1; i2 < this.bodies.length; ++i2) {
			obj2 = this.bodies[i2];
			if (obj1 !== obj2) {
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

				if (distSquare > utils.sqr(obj1.getRadius() + obj2.getRadius())) {
					dist = Math.sqrt(distSquare);

					if (obj1.affectedByGravity) {
						var force1 = obj2.getMass() / distSquare * obj2.attraction;
						obj1.vx += force1 * diffX / dist;
						obj1.vy += force1 * diffY / dist;
					}
					if (obj2.affectedByGravity) {
						var force2 = obj1.getMass() / distSquare * obj1.attraction;
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
			obj1.vx = (obj1.getMass() * obj1.vx + obj2.getMass() * obj2.vx) / (obj1.getMass() + obj2.getMass());
			obj1.vy = (obj1.getMass() * obj1.vy + obj2.getMass() * obj2.vy) / (obj1.getMass() + obj2.getMass());

			obj1.setArea(area); // Setting obj1's area must happen after calculating velocity!
			biggestRadius = Math.max(obj2.getRadius(), biggestRadius);
			obj1.attraction = Math.max(obj1.attraction, obj2.attraction);

			this.garbage.push(obj2);
		}
		obj1.setColor(this.palette.light.getRandomItem());
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
	this.collisions = [];
	for (i = 0; i < this.garbage.length; ++i) {
		obj = this.garbage[i];

		var index = this.bodies.indexOf(obj);
		if (index > -1)
			this.bodies.splice(index, 1);
		else throw new Error("Tried to dump unexistent object from `bodies` array.");

		if (obj) this.removeChild(obj);
	}
	this.garbage = [];
};
createjs.promote(SDU.GameScene, "SDUScene");