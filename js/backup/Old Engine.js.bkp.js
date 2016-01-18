/*
 * Stardust — Engine.js
 * Made by Tiago Marinho
 * using CreateJS.
 */

// TODO: BIG CODE REVIEW.

var Star = function(canvas) {
	this.canvas = document.getElementById(canvas);
	this.stage = new createjs.Stage(this.canvas);
	this.scene = new createjs.Container();
	this.route = new createjs.Shape();
	this.physicsBodies = [];
	this.collisions = [];
	this.trashQueue = [];
	this.palette = ["#FF4650", "#FFD939", "#97FB32", "#32CEF4", "#FE60D6"];
	this.planetNames = ["Sphynx", "Chausie", "Raas", "Sokoke", "Chartreux", "Cymric", "Lykoi"];
	this.selectedObj = null;
	this.init = (function(self) {
		createjs.Ticker.timingMode = createjs.Ticker.RAF;
		Star.self = self;

		self.route.cache(-window.innerWidth, -window.innerHeight, window.innerWidth * 3, window.innerHeight * 3);
		self.route.alpha = 0.075;

		self.stage.preventSelection = true;
		self.stage.addChild(self.scene);
		self.scene.addChild(self.route);
	})(this);
};
Star.prototype.config = {
	dottedRoute: false,
	whoami: null,
	blend: navigator.sayswho.indexOf("Firefox") < 0
};
Star.prototype.paused = false;
Star.prototype.tickTime = 0;
Star.prototype.iterations = 1;
Star.prototype.run = function() {
	/*for (var i1 = 0; i1 < 10; i1++) {
		for (var i2 = 0; i2 < 25; i2++) {
		var planet = new Planet(this, utils.getRandomInt(0, window.innerWidth), utils.getRandomInt(0, window.innerHeight), 2, "rgba(255, 255, 255, 0.25)", {
			name: Star.self.planetNames.getRandomItem(),
			density: 1
		}, this.scene);
		this.physicsBodies.push(planet);
		}
	}*/
	this.tick(0, 0);
	this.listen();
};
Star.prototype.tick = function(iterations, delta) {
	var now = performance.now();
	if (!Star.self.paused) {
		for (var i = 0; i < Star.self.iterations; i++) {
			Star.self.step(now - delta);
		}
		if (Star.self.selectedObj) {
			var position = Star.self.scene.localToGlobal(Star.self.selectedObj.physicsBody.x, Star.self.selectedObj.physicsBody.y);
			$("#properties").show();
			$("#properties .planetName").html(Star.self.selectedObj.physicsBody.name);
			$("#properties > h1.title").css({
				"border-color": Star.self.selectedObj.physicsBody.color
			});
			if (Star.self.selectedObj.physicsBody.density >= 500) $("#atmosphere").attr("disabled", true);
			else $("#atmosphere").attr("disabled", false);
			$("#properties").css({
				top: position.y + Star.self.selectedObj.physicsBody.radius + 5,
				left: position.x - $("#properties").width() / 2
			});
		} else {
			$("#properties").hide();
		}

		if (Star.self.config.whoami !== null) Star.self.setCameraFocus(Star.self.config.whoami);
	}

	now = performance.now();
	Star.self.tickTime = now - delta;
	Star.self.stage.update();
	requestAnimationFrame(function() {
		Star.self.tick(iterations, now);
	});
};
Star.prototype.step = function(delta) {
	this.physicsBodies.forEach(function(obj) {
		obj.physicsBody.px = obj.physicsBody.x;
		obj.physicsBody.py = obj.physicsBody.y;

		if (obj.physicsBody.movable) {
			obj.physicsBody.x += /*delta /*/ obj.physicsBody.vx / 100; // TODO: Time based.
			obj.physicsBody.y += /*delta /*/ obj.physicsBody.vy / 100;
		}
		if (obj.physicsBody.drawRoute && obj.physicsBody.radius > 1.5) {
			// FIXME/TODO: Implement a buffer which is greater than the screen, and switch it's contents to the main route object when user moves the camera out of bounds.
			if (this.config.dottedRoute) {
				this.route.graphics.f("#FFF").dc(obj.physicsBody.x, obj.physicsBody.y, 0.5);
			} else {
				this.route.graphics.s("#FFF").ss(0.5, "round").mt(obj.physicsBody.px, obj.physicsBody.py).lt(obj.physicsBody.x, obj.physicsBody.y);
			}
			if (this.config.blend) this.route.updateCache("source-overlay");
		}
	}, this);
	this.route.graphics.clear();
	this.physicsBodies.forEach(function(obj1, index) {
		if (obj1.physicsBody.affectedByGravity && obj1.physicsBody.movable) {
			this.physicsBodies.forEach(function(obj2) {
				if (obj1 !== obj2) {

					var diffX = obj2.physicsBody.x - obj1.physicsBody.x,
						diffY = obj2.physicsBody.y - obj1.physicsBody.y;
					var distSquare = diffX * diffX + diffY * diffY;
					var dist = Math.sqrt(distSquare);
					var distanceToLine = utils.distToSegment(obj2.physicsBody, {
						x: obj1.physicsBody.px,
						y: obj1.physicsBody.py
					}, {
						x: obj1.physicsBody.x,
						y: obj1.physicsBody.y
					});

					if (distanceToLine > obj1.physicsBody.radius + obj2.physicsBody.radius) {

						var force = obj2.physicsBody.getMass() / distSquare;
						obj1.physicsBody.vx += force * diffX / dist * obj2.physicsBody.attraction;
						obj1.physicsBody.vy += force * diffY / dist * obj2.physicsBody.attraction;

					} else if (obj1.physicsBody.collidable && obj2.physicsBody.collidable) {
						if (obj1.physicsBody.fusionable && obj2.physicsBody.fusionable) {
							var alreadyHadCollisions = false;
							this.collisions.forEach(function(arr) {
								if (arr.indexOf(obj1) > -1 && arr.indexOf(obj2) === -1)
									arr.push(obj2);
								else if (arr.indexOf(obj1) === -1 && arr.indexOf(obj2) > -1)
									arr.push(obj1);

								if (arr.indexOf(obj1) > -1 || arr.indexOf(obj2) > -1)
									alreadyHadCollisions = true;
							});
							if (!alreadyHadCollisions)
								this.collisions.push([obj1, obj2]);
						} else {
							// TODO: Perfectly elastic collision.
						}
					} else {
						// TODO: Continue applying gravity, but prevent it from eventually going to infinity.
					}
				}
			}, this);
		}
	}, this);
	this.collisions.forEach(function(targets) {
		var obj1 = targets[0],
			biggestRadius = obj1.physicsBody.radius;
		for (var i = 1; i < targets.length; i++) {
			var obj2 = targets[i];
			if (this.selectedObj === obj2) this.selectedObj = obj1;
			if (this.config.whoami === obj2.physicsBody) this.config.whoami = obj1.physicsBody;
			obj1.physicsBody.x = (obj1.physicsBody.getMass() * obj1.physicsBody.x + obj2.physicsBody.getMass() * obj2.physicsBody.x) / (obj1.physicsBody.getMass() + obj2.physicsBody.getMass());
			obj1.physicsBody.y = (obj1.physicsBody.getMass() * obj1.physicsBody.y + obj2.physicsBody.getMass() * obj2.physicsBody.y) / (obj1.physicsBody.getMass() + obj2.physicsBody.getMass());

			var density = Math.max(obj1.physicsBody.density, obj2.physicsBody.density),
				area = obj1.physicsBody.getArea() * (obj1.physicsBody.density / density) + obj2.physicsBody.getArea() * (obj2.physicsBody.density / density),
				radius = Math.sqrt(area / Math.PI);

			obj1.physicsBody.vx = (obj1.physicsBody.getMass() * obj1.physicsBody.vx + obj2.physicsBody.getMass() * obj2.physicsBody.vx) / (obj1.physicsBody.getMass() + obj2.physicsBody.getMass());
			obj1.physicsBody.vy = (obj1.physicsBody.getMass() * obj1.physicsBody.vy + obj2.physicsBody.getMass() * obj2.physicsBody.vy) / (obj1.physicsBody.getMass() + obj2.physicsBody.getMass());

			obj1.physicsBody.setRadius(radius);
			obj1.physicsBody.density = density;

			if (obj2.physicsBody.radius > biggestRadius)
				biggestRadius = obj2.physicsBody.radius;

			var isBlackHole = density >= 500,
				color = isBlackHole ? "#000810" : this.palette.getRandomItem(),
				shadow = isBlackHole ? new createjs.Shadow("rgba(255, 255, 255, 0.25)", 0, 0, 5) : null;

			obj1.physicsBody.setColor(color);
			obj1.physicsBody.shadow = shadow;
			this.trashQueue.push(obj2);
			obj2.physicsBody.collidable = false;
			obj2.physicsBody.attraction = 0;
			obj2.physicsBody.setColor("rgba(0, 0, 0, 0)");
		}
		obj1.physicsBody.scaleX = obj1.physicsBody.scaleY = biggestRadius / obj1.physicsBody.radius;

		createjs.Tween.get(obj1.physicsBody, {
			override: true
		}).to({
			scaleX: 1,
			scaleY: 1
		}, 1000, createjs.Ease.elasticOut);
	}, this);
	this.collisions = [];
	this.trashQueue.forEach(function(obj) {
		if (this.selectedObj === obj)
			this.selectedObj = null;

		var index = this.physicsBodies.indexOf(obj);
		if (index > -1)
			this.physicsBodies.splice(index, 1);

		if (obj && obj.physicsBody)
			this.scene.removeChild(obj.physicsBody);

		index = this.trashQueue.indexOf(obj);
		if (index > -1)
			this.trashQueue.splice(index, 1);
	}, this);
};
Star.prototype.listen = function() {
	var mouse = {
		x: 0,
		y: 0,
		down: false,
		indicator: {
			size: null,
			speed: []
		}
	};

	for (var i = 0; i < 3; i++) {
		var speed = new Arrow(0, 0, 5, 10, null, "#FFF", 1);
		speed.shape.alpha = 0;
		speed.shape.regX = -10 + (i * -7);
		mouse.indicator.speed.push(speed);
	}

	window.addEventListener("keydown", function(e) {
		if (key.isDown(key.SPACE_BAR)) {
			Star.self.paused = !Star.self.paused;
		}
		if (key.isDown(key.W)) {
			Star.self.iterations = Star.self.iterations === 1 ? 50 : 1;
		}
	});

	this.stage.on("stagemousedown", function(e) {
		mouse.down = true;
		mouse = utils.merge(mouse, this.scene.globalToLocal(e.stageX, e.stageY));

		var objUnderPoint = this.getBodyUnderPoint(mouse.x, mouse.y, 5);

		if (objUnderPoint) {
			this.selectedObj = objUnderPoint;
		} else if (this.selectedObj) {
			this.selectedObj = null;
		} else {
			for (var i = 0; i < mouse.indicator.speed.length; i++) {
				Star.self.scene.addChild(mouse.indicator.speed[i].shape);
				mouse.indicator.speed[i].shape.set({
					x: mouse.x,
					y: mouse.y
				});
			}

			var size = new createjs.Shape();
			size.graphics.s("#FFF").dc(0.5, 0.5, 5);
			size.x = mouse.x;
			size.y = mouse.y;
			size.cache(-6, -6, 12, 12);
			mouse.indicator.size = size;
			this.scene.addChild(mouse.indicator.size);
		}
	}, this);
	this.stage.on("stagemousemove", function(e) {
		var currentPos = this.scene.globalToLocal(e.stageX, e.stageY);
		if (mouse.down) {
			if (!this.selectedObj) {
				var diffX = e.stageX - mouse.x,
					diffY = e.stageY - mouse.y;
				var distSquare = diffX * diffX + diffY * diffY;
				var dist = Math.sqrt(distSquare);

				for (var i = 0; i < mouse.indicator.speed.length; i++) {
					mouse.indicator.speed[i].shape.alpha = (dist - 5 - i * 100) / ((i + 1) * 100);
					mouse.indicator.speed[i].pointTo(currentPos.x, currentPos.y);
				}
			}
		}
	}, this);
	this.stage.on("stagemouseup", function(e) {
		if (mouse.down) {
			var currentPos = this.scene.globalToLocal(e.stageX, e.stageY);
			mouse.down = false;

			if (mouse.indicator.size) {
				var vx = currentPos.x - mouse.x,
					vy = currentPos.y - mouse.y;
				var color = key.isDown(key.SHIFT) ? "#000810" : this.palette.getRandomItem();

				var obj = new Planet(this, mouse.x, mouse.y, 5, color, {
					name: Star.self.planetNames.getRandomItem(),
					vx: vx,
					vy: vy,
					scaleX: 0,
					scaleY: 0,
					density: key.isDown(key.SHIFT) ? 500 : 1,
					shadow: key.isDown(key.SHIFT) ? new createjs.Shadow("rgba(255, 255, 255, 0.25)", 0, 0, 5) : null
				}, this.scene);
				this.physicsBodies.push(obj);
				createjs.Tween.get(obj.physicsBody, {
					override: true
				}).to({
					scaleX: 1,
					scaleY: 1
				}, 1000, createjs.Ease.elasticOut);

				for (var i = 0; i < mouse.indicator.speed.length; i++) {
					mouse.indicator.speed[i].shape.alpha = 0;
					Star.self.scene.removeChild(mouse.indicator.speed[i].shape);
				}
				this.scene.removeChild(mouse.indicator.size);
				mouse.indicator.size = null;
			}
		}
	}, this);
	var pausedAfterBlur = false;
	window.addEventListener("blur", function() {
		if (!Star.self.paused) {
			Star.self.paused = true;
			pausedAfterBlur = true;
		}
	});
	window.addEventListener("focus", function() {
		if (pausedAfterBlur) {
			Star.self.paused = false;
			pausedAfterBlur = false;
		}
	});
};
Star.prototype.getBodyUnderPoint = function(x, y, margin) { // Expensive!
	var body = null;
	this.physicsBodies.forEach(function(obj) {
		var diffX = obj.physicsBody.x - x,
			diffY = obj.physicsBody.y - y;
		var distSquare = diffX * diffX + diffY * diffY;
		var dist = Math.sqrt(distSquare);
		if (dist < obj.physicsBody.radius + (margin || 0)) {
			body = obj;
		}
	});
	return body;
};
Star.prototype.setCameraFocus = function(obj) {
	var _scrX = Math.round(this.canvas.width / 2) - (obj.x);
	var _scrY = Math.round(this.canvas.height / 2) - (obj.y);

	createjs.Tween.get(this.scene, {
		override: true
	}).to({
		x: _scrX,
		y: _scrY
	}, 100, createjs.Ease.quadInOut);
};