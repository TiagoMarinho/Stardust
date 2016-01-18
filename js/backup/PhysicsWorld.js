var SDU = SDU || {};
SDU.PhysicsWorld = function(gravity) {
	this.gravity = gravity || {
		dx: 0,
		dy: 8
	};
	this.bodies = [];
	this.collisions = [];
	this.garbage = [];
};