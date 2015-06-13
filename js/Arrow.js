var Arrow = function (x, y, length, width, fillColor, strokeColor, strokeStyle, parent, snapToPixel) {
    snapToPixel = snapToPixel || true;
    var regX = (snapToPixel) ? 0.5 : 0;
    this.shape = new createjs.Shape();
    this.shape.graphics.f(fillColor).s(strokeColor).ss(strokeStyle).mt(regX, 0).lt(regX, -width / 2).lt(length, 0).lt(regX, width / 2).lt(regX, 0); // `.5` enforces pixel snapping.
    this.shape.cache(0 - strokeStyle, -width / 2 - strokeStyle, length + strokeStyle * 2, width + strokeStyle * 2);
    this.shape.graphics.clear();
    this.shape.set({
        x: x,
        y: y
    });
    if (parent) parent.addChild(this.shape);
};
Arrow.prototype.pointTo = function (x, y) {
    this.shape.rotation = Math.atan2(y - this.shape.y, x - this.shape.x) * (180 / Math.PI);
};
