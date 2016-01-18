var SDU = SDU || {};
SDU.Scene = function(canvas) {
	this.createjsStage_constructor(canvas);
	this.mouse = {
		x: null,
		y: null
	};
	var _this = this;
	this.addEventListener("stagemousemove", function(e) {
		_this.mouse.x = e.stageX;
		_this.mouse.y = e.stageY;
	});
};
createjs.extend(SDU.Scene, createjs.Stage);
createjs.promote(SDU.Scene, "createjsStage");