var SDU = SDU || {};
SDU.Arrow = function(x, y, width, length, color, strokeWidth, properties, parent) {
    this.createjsShape_constructor();
    this.graphics.s(color).ss(strokeWidth).mt(0, 0).lt(0, -length).mt(-width, -length + width).lt(0, -length).lt(width, -length + width);
    this.set({
        x: x,
        y: y,
        color: color,
        stroke: {
            width: strokeWidth
        }
    }).set(properties);
    this.cache(-width - strokeWidth / 2, -length - strokeWidth / 2, width * 2 + strokeWidth, length + strokeWidth, 1.5); // 1.5x the resolution for less blurring on Safari due to lowres.
    if (parent) parent.addChild(this);
};
createjs.extend(SDU.Arrow, createjs.Shape);
createjs.promote(SDU.Arrow, "createjsShape");