var Star = function(canvas) {
	this.canvas = document.getElementById(canvas);
	this.stage = new createjs.Stage(this.canvas);
	this.scene = new createjs.Container();
	this.route = new createjs.Shape();
	this.physicsBodies = [];
	this.trashQueue = [];
	this.palette = ["#FF4650", "#FFD939", "#97FB32", "#32CEF4", "#FE60D6"];
	this.planetNames = ["Sphynx", "Chausie", "Raas", "Sokoke", "Chartreux", "Cymric", "Lykoi"];
	this.selectedObj = null;
	this.init = (function(self) {
		createjs.Ticker.timingMode = createjs.Ticker.RAF;
		Star.self = self;

		self.route.cache(0, 0, window.innerWidth, window.innerHeight);
		self.route.compositeOperation = "destination-atop";
		self.route.alpha = 0.05;

		self.stage.addChild(self.scene);
		self.scene.addChild(self.route);
	})(this);
};
Star.prototype.config = {};
Star.prototype.tickTime = 0;
Star.prototype.run = function() {
	for (var i1 = 0; i1 < 15; i1++) {
		for (var i2 = 0; i2 < 7; i2++) {
			var planet = new Planet(this, 720 / 15 * i1, 480 / 7 * i2, 5, "#67676f", {
				name: Star.self.planetNames.getRandomItem(),
				density: 1
			}, this.scene);
			this.physicsBodies.push(planet);
		}
	}
	this.tick(0, 0);
	this.listen();
};
Star.prototype.tick = function(iterations, delta) {
	var now = performance.now();

	for (var i = 0; i < 1; i++) {
		Star.self.step(now - delta);
	}
	Star.self.stage.update();
	if (Star.self.selectedObj) {
		$("#properties").show();
		$("#properties .planetName").html(Star.self.selectedObj.physicsBody.name);
		$("#properties > h1.title").css({
			"border-color": Star.self.selectedObj.physicsBody.color
		});
		$("#properties").css({
			top: Star.self.selectedObj.physicsBody.y + Star.self.selectedObj.physicsBody.radius + 5,
			left: Star.self.selectedObj.physicsBody.x - 120
		});
	} else {
		$("#properties").hide();
	}

	now = performance.now();
	Star.self.tickTime = now - delta;

	requestAnimationFrame(function() {
		Star.self.tick(iterations, now);
	});
};
Star.prototype.step = function(delta) {
	this.physicsBodies.forEach(function(obj) {
		obj.physicsBody.px = obj.physicsBody.x;
		obj.physicsBody.py = obj.physicsBody.y;

		if (obj.physicsBody.movable) {
			obj.physicsBody.x += /*delta / 1000 **/ (obj.physicsBody.vx / 100); // TODO: Time based.
			obj.physicsBody.y += /*delta / 1000 **/ (obj.physicsBody.vy / 100);
		}
		if (obj.physicsBody.drawRoute && obj.physicsBody.radius > 1.5) {
			this.route.graphics.s("#FFF").ss(3, "round").mt(obj.physicsBody.px, obj.physicsBody.py).lt(obj.physicsBody.x, obj.physicsBody.y);
			this.route.updateCache("source-overlay");
			this.route.graphics.clear();
		}
	}, this);
	this.physicsBodies.forEach(function(obj1) {
		if (obj1.physicsBody.affectedByGravity && obj1.physicsBody.movable) {
			this.physicsBodies.forEach(function(obj2) {
				if (obj1 !== obj2 && obj1.physicsBody.antecessors.indexOf(obj2) < 0 && obj2.physicsBody.antecessors.indexOf(obj1) < 0) {

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

					} else if (obj1.physicsBody.collidable && obj2.physicsBody.collidable) { // FIXME: obj3 is created during the loop, compromisind symmetry and precision on programmatically made systems.
						if (obj1.physicsBody.fusionable && obj2.physicsBody.fusionable && utils.getAverage(obj1.physicsBody.attraction, obj2.physicsBody.attraction) >= 0) {

							var massCenterX = (obj1.physicsBody.getMass() * obj1.physicsBody.x + obj2.physicsBody.getMass() * obj2.physicsBody.x) / (obj1.physicsBody.getMass() + obj2.physicsBody.getMass()),
								massCenterY = (obj1.physicsBody.getMass() * obj1.physicsBody.y + obj2.physicsBody.getMass() * obj2.physicsBody.y) / (obj1.physicsBody.getMass() + obj2.physicsBody.getMass());

							var collisionPointX = (obj1.physicsBody.x * obj2.physicsBody.radius + obj2.physicsBody.x * obj1.physicsBody.radius) / (obj1.physicsBody.radius + obj2.physicsBody.radius),
								collisionPointY = (obj1.physicsBody.y * obj2.physicsBody.radius + obj2.physicsBody.y * obj1.physicsBody.radius) / (obj1.physicsBody.radius + obj2.physicsBody.radius);

							var biggestRadius = Math.max(obj1.physicsBody.radius, obj2.physicsBody.radius),
								biggestObj = obj1.physicsBody.radius > obj2.physicsBody.radius ? obj1 : (obj1.physicsBody.radius < obj2.physicsBody.radius) ? obj2 : null,
								biggestDensity = Math.max(obj1.physicsBody.density, obj2.physicsBody.density);

							var isBlackHole = biggestDensity === 500,
								color = isBlackHole ? "#1A212A" : this.palette.getRandomItem(),
								shadow = isBlackHole ? new createjs.Shadow("#383F49", 0, 0, 5) : null;

							var area = obj1.physicsBody.getArea() * (obj1.physicsBody.density / biggestDensity) + obj2.physicsBody.getArea() * (obj2.physicsBody.density / biggestDensity),
								radius = Math.sqrt(area / Math.PI),
								vx = (obj1.physicsBody.getMass() * obj1.physicsBody.vx + obj2.physicsBody.getMass() * obj2.physicsBody.vx) / (obj1.physicsBody.getMass() + obj2.physicsBody.getMass()),
								vy = (obj1.physicsBody.getMass() * obj1.physicsBody.vy + obj2.physicsBody.getMass() * obj2.physicsBody.vy) / (obj1.physicsBody.getMass() + obj2.physicsBody.getMass());

							var obj3 = new Planet(this, massCenterX, massCenterY, radius, color, {
								name: biggestObj ? biggestObj.physicsBody.name : this.planetNames.getRandomItem(),
								vx: vx,
								vy: vy,
								scaleX: biggestRadius / radius,
								scaleY: biggestRadius / radius,

								density: biggestDensity,
								movable: (obj1.physicsBody.movable && obj2.physicsBody.movable),
								antecessors: [obj1, obj2],

								shadow: shadow,
								compositeOperation: "overlay"
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

							obj1.physicsBody.attraction = 0;
							obj2.physicsBody.attraction = 0;

							this.trashQueue.push(obj1, obj2);
							obj1.physicsBody.collidable = obj2.physicsBody.collidable = false;
						} else {
							// TODO: Perfectly inelastic circle collision.
						}
					}
				}
			}, this);
		}
	}, this);
	this.trashQueue.forEach(function(obj) {
		if (this.selectedObj === obj) this.selectedObj = null;
		var index = this.physicsBodies.indexOf(obj);
		if (index > -1) {
			this.physicsBodies.splice(index, 1);
		}
		this.scene.removeChild(obj.physicsBody);
		index = this.trashQueue.indexOf(obj);
		if (index > -1) {
			this.trashQueue.splice(index, 1);
		}
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

	this.stage.on("stagemousedown", function(e) {
		mouse.down = true;
		mouse.x = e.stageX;
		mouse.y = e.stageY;

		var objUnderPoint;
		this.physicsBodies.forEach(function(obj) {
			var diffX = obj.physicsBody.x - mouse.x,
				diffY = obj.physicsBody.y - mouse.y;
			var distSquare = diffX * diffX + diffY * diffY;
			var dist = Math.sqrt(distSquare);
			if (dist < obj.physicsBody.radius + 5) {
				if (!objUnderPoint || this.scene.indexOf(objUnderPoint) < this.scene.indexOf(obj)) {
					objUnderPoint = obj;
				}
			}
		});

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
		if (mouse.down) {
			if (!this.selectedObj) {
				var diffX = e.stageX - mouse.x,
					diffY = e.stageY - mouse.y;
				var distSquare = diffX * diffX + diffY * diffY;
				var dist = Math.sqrt(distSquare);

				for (var i = 0; i < mouse.indicator.speed.length; i++) {
					mouse.indicator.speed[i].shape.alpha = (dist - 5 - i * 100) / ((i + 1) * 100);
					mouse.indicator.speed[i].pointTo(e.stageX, e.stageY);
				}
			}
		}
	}, this);
	this.stage.on("stagemouseup", function(e) {
		if (mouse.down) {
			mouse.down = false;

			if (mouse.indicator.size) {
				var vx = e.stageX - mouse.x,
					vy = e.stageY - mouse.y;
				var color = key.isDown(key.SHIFT) ? "#1A212A" : this.palette.getRandomItem();

				var obj = new Planet(this, mouse.x, mouse.y, 5, color, {
					name: Star.self.planetNames.getRandomItem(),
					vx: vx,
					vy: vy,
					scaleX: 0,
					scaleY: 0,
					density: key.isDown(key.SHIFT) ? 500 : 1,
					shadow: key.isDown(key.SHIFT) ? new createjs.Shadow("#383F49", 0, 0, 5) : null,
					compositeOperation: "overlay"
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
};
