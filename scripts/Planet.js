var Planet = function (app, x, y, radius, color, density, parent, properties) {
    this.shape = new createjs.Shape();

    this.shape.graphics.f(color).dc(0, 0, radius);
    this.shape.cache(-radius, -radius, radius*2, radius*2, 1.25);
    this.shape.graphics.clear();

    this.shape.set({
        x: x, y: y,
        px: x, py: y,
        vx: 0, vy: 0,
        radius: radius,
        scaleX: 0, scaleY: 0,
        density: density,
        color: color,
        movable: true,
        collidable: true,
        affectedByGravity: true,
        drawRoute: true,
        //compositeOperation: "xor",
        getMass: function () {
            return this.getArea() * this.density;
        },
        getArea: function () {
            return Math.PI * this.radius * this.radius;
        }
    }).set(properties || {});

    if (parent) parent.addChild(this.shape);
    createjs.Tween.get(this.shape, {override: true}).to({scaleX: 1, scaleY: 1}, 1000, createjs.Ease.elasticOut);
};
