//"use strict";
class Stardust extends createjs.Stage {
	constructor(canvas) {
		super(canvas);
		this.bodies = [];
		this.collisions = [];
		this.garbage = [];
		this.palette = {
			dark: ["#FF4650", "#FFD939", "#97FB32", "#32CEF4", "#FE60D6"],
			github: ["#0FBEB8", "#45A8E9", "#E44255", "#555E70", "#393E4A"],
			spacegray: ["#CF7758", "#9FB6A3", "#A878A6", "#7D8FA6", "#B04C56", "#3D4754", "#3D4754"]
		};
		this.debugData = {
			constraints: 0
		};
		this.config = {
			drawConstraints: false,
			drawTrails: true,
			drawAABBs: false,
			usePreciseCollisionDetection: false
		};
		this.paused = false;

		this.trail = new createjs.Shape();
		this.trail.cache(0, 0, innerWidth, innerHeight);
		this.addChild(this.trail);

		this.buffer = new createjs.Bitmap(this.trail.cacheCanvas);
		this.buffer.cache(0, 0, innerWidth, innerHeight);
		this.addChildAt(this.buffer, 0);
	}
	get fps() {
		return createjs.Ticker.getMeasuredFPS(0);
	}
	clearTrails(fadeOutDuration) {
		this.buffer.updateCache();
		this.trail.updateCache();
		this.buffer.alpha = 1;
		createjs.Tween.get(this.buffer).to({alpha: 0}, fadeOutDuration);
	}
	step() {
		var i, i1, i2, i3, i4,
			obj, obj1, obj2, obj3,
			collision;
		for (i = 0; i < this.bodies.length; ++i) {
			obj = this.bodies[i];

			obj.px = obj.x;
			obj.py = obj.y;

			obj.x += obj.vx / 100;
			obj.y += obj.vy / 100;
			obj.rotation = Math.atan2(obj.vy, obj.vx) / Math.PI * 180;

			this.trail.graphics.s("#232129").ss(1).mt(obj.px, obj.py).lt(obj.x, obj.y);
		}
		this.trail.updateCache("source-over");
		this.trail.graphics.clear();
		this.debugData.constraints = 0;
		for (i1 = 0; i1 < this.bodies.length - 1; ++i1) {
			obj1 = this.bodies[i1];
			for (i2 = i1 + 1; i2 < this.bodies.length; ++i2) {
				obj2 = this.bodies[i2];
				++this.debugData.constraints;

				var distanceSqr;
				if (!this.config.usePreciseCollisionDetection) {
					var diffX = obj2.x - obj1.x,
						diffY = obj2.y - obj1.y;
					distanceSqr = diffX * diffX + diffY * diffY;
				} else {
					var current1 = obj1,
						past1 = {x: obj1.px, y: obj1.py},
						current2 = obj2,
						past2 = {x: obj2.px, y: obj2.py};
					distanceSqr = Utils.distanceBetweenSegmentsSquared(current1, past1, current2, past2);
				}

				var angleToObj1 = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);

				if (distanceSqr > (obj1.radius + obj2.radius) * (obj1.radius + obj2.radius)) {
					obj1.vx += obj2.mass / distanceSqr * Math.cos(angleToObj1);
					obj1.vy += obj2.mass / distanceSqr * Math.sin(angleToObj1);

					obj2.vx -= obj1.mass / distanceSqr * Math.cos(angleToObj1);
					obj2.vy -= obj1.mass / distanceSqr * Math.sin(angleToObj1);
				} else if(obj1.collidable && obj2.collidable) {
					var alreadyHadCollisions = false,
						collisionIndex = -1;
					i3 = this.collisions.length;
					while (i3--) {
						var index1, index2;
						collision = this.collisions[i3];
						index1 = collision.indexOf(obj1);
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
			var biggestArea, scaleFactor;
			collision = this.collisions[i1];
			obj1 = collision[0];
			biggestArea = obj1.area;
			for (i2 = 1; i2 < collision.length; ++i2) {
				obj2 = collision[i2];

				this.trail.graphics.s("#232129").sd([2, 2]).ss(1).mt(obj1.x, obj1.y).lt(obj2.x, obj2.y);
				biggestArea = Math.max(biggestArea, obj2.area);
				obj1.x = (obj1.mass * obj1.x + obj2.mass * obj2.x) / (obj1.mass + obj2.mass);
				obj1.y = (obj1.mass * obj1.y + obj2.mass * obj2.y) / (obj1.mass + obj2.mass);
				obj1.px = obj1.x;
				obj1.py = obj1.y;
				obj1.vx = (obj1.mass * obj1.vx + obj2.mass * obj2.vx) / (obj1.mass + obj2.mass);
				obj1.vy = (obj1.mass * obj1.vy + obj2.mass * obj2.vy) / (obj1.mass + obj2.mass);
				obj1.area += obj2.area;
				this.garbage.push(obj2);
			}
			/*var numberOfParticles = Utils.getRandomInt(0, 10);
			for(i = 0; i < numberOfParticles; ++i) {
				var radius = 2;
				var angle = Math.PI * 2 / numberOfParticles * i;
				var force = obj1.radius + radius + 1;
				var x = force * Math.cos(angle) + obj1.x, y = force * Math.sin(angle) + obj1.y;
				var particle = new Planet(x, y, radius, obj1.color);
				particle.vx = force * 50 * Math.cos(angle);
				particle.vy = force * 50 * Math.sin(angle);
				particle.collidable = false;
				this.bodies.push(particle);
				this.addChild(particle);
			}*/
			scaleFactor = biggestArea / obj1.area;
			obj1.redraw();
			obj1.scaleX = obj1.scaleY = scaleFactor;
			createjs.Tween.get(obj1, {
				override: true
			}).to({
				scaleX: 1,
				scaleY: 1
			}, 1000, createjs.Ease.elasticOut);
		}
		this.trail.updateCache("source-over");
		this.collisions.length = 0;
		var garbageNotFoundError = new Error("Tried to dump unexistent object from `bodies` array. " + obj);
		garbageNotFoundError.name = "GCError";
		for (i = 0; i < this.garbage.length; ++i) {
			obj = this.garbage[i];

			var index = this.bodies.indexOf(obj);
			if (index > -1)
				this.bodies.splice(index, 1);
			else throw garbageNotFoundError;

			if (obj.parent && obj.parent.getChildIndex(obj) > -1) obj.parent.removeChild(obj);
			obj = null;
		}
		this.garbage.length = 0;
	}
	run() {
		var n = 1000;
		for (var i = 0; i < n; ++i) {
			var x = Utils.getRandomInt(0, innerWidth),
				y = Utils.getRandomInt(0, innerHeight),
				radius = 5,
				color = Utils.getRandomItem(this.palette.github);

			var planet = new Planet(x, y, radius, color);
			this.addChild(planet);
			this.bodies.push(planet);
		}

		var self = this;
		var mouse = {down: false};
		createjs.Ticker.timingMode = createjs.Ticker.RAF;
		createjs.Ticker.addEventListener("tick", function(e) {
			if (!self.paused)
				self.step();
			self.update();
		});
		setInterval(function(){
			self.clearTrails(30000);
		}, 30000);
		this.addEventListener("stagemousedown", function (e) {
			mouse.down = {x: e.stageX, y: e.stageY};
		});
		this.addEventListener("stagemouseup", function (e) {
			var color = Utils.getRandomItem(self.palette.github);

			var diffX = e.stageX - mouse.down.x,
				diffY = e.stageY - mouse.down.y;

			var angle = Math.atan2(diffY, diffX),
				force = Math.sqrt(diffX * diffX + diffY * diffY);

			var vx = force * Math.cos(angle),
				vy = force * Math.sin(angle);

			var planet = new Planet(mouse.down.x, mouse.down.y, 5, color);
			planet.set({vx, vy, scaleX: 0, scaleY: 0});
			createjs.Tween.get(planet).to({scaleX: 1, scaleY: 1}, 1000, createjs.Ease.elasticOut);
			self.addChild(planet);
			self.bodies.push(planet);
			mouse.down = false;
		});
	}
}
