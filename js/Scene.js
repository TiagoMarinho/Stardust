var SDU = SDU || {};
SDU.Scene = function(canvas) {
	this.createjsStage_constructor(canvas);
	this.bodies = [];
	this.mouse = {
		x: 0,
		y: 0
	};
	var _this = this;
	this.addEventListener("stagemousemove", function(e) {
		_this.mouse.x = e.stageX;
		_this.mouse.y = e.stageY;
	});
};
createjs.extend(SDU.Scene, createjs.Stage);
SDU.Scene.prototype.addChild = function(child) {
	this.bodies.push(child);
	this.createjsStage_addChild(child);
};
SDU.Scene.prototype.addChildAt = function(child, index) {
	this.bodies.push(child);
	this.createjsStage_addChildAt(child, index);
};
createjs.promote(SDU.Scene, "createjsStage");