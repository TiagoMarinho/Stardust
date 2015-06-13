var Planet = function (app, x, y, radius, color, properties, parent, resolution) {
    this.physicsBody = new createjs.Shape();
    this.physicsBody.graphics.f(color).dc(0, 0, radius);
    //this.shape.graphics.lf([color, "black"], [0, 1], 0, -radius, 0, radius).dc(0, 0, radius);
    //this.physicsBody = new createjs.Sprite(parent.spriteSheet);
    //this.physicsBody.gotoAndStop(radius);

    this.physicsBody.set({
        super: this,

        x: x, y: y,
        px: x, py: y,
        radius: radius,
        color: color,
        resolution: resolution || 1.3,

        scaleX: 1, scaleY: 1,
        vx: 0, vy: 0,

        movable: true,
        collidable: true,
        fusionable: true,
        density: 1,
        affectedByGravity: true,
        attraction: 1,
        antecessors: [],
        drawRoute: true,
        timeScale: 1,
        getMass: function () {
            return this.getArea() * this.density;
        },
        setMass: function (newValue, changeArea, updateView) {
            if (!changeArea) {
                this.density = newValue / this.getArea();
            } else {
                this.setArea(newValue / this.density, updateView);
            }
        },
        getArea: function () {
            return Math.PI * this.radius * this.radius;
        },
        setArea: function (newValue, updateView) {
            this.radius = Math.sqrt(newValue / Math.PI);
            if (updateView) {
                this.graphics.f(this.color).dc(0, 0, this.radius);
                this.cache(-this.radius, -this.radius, this.radius * 2, this.radius * 2, this.resolution);
                this.graphics.clear();
            }
        },
        getRadius: function () {
            return this.radius;
        },
        setRadius: function (newValue, updateView) {
            this.radius = newValue;
            if (updateView) {
                this.graphics.f(this.color).dc(0, 0, newValue);
                this.cache(-newValue, -newValue, newValue * 2, newValue * 2, this.resolution);
                this.graphics.clear();
            }
        }
    }).set(properties || {});

    this.physicsBody.cache(-radius, -radius, radius*2, radius*2, resolution || 1.3); // caching must happen after property setup if you want to handle filters.
    this.physicsBody.graphics.clear();

    if (parent) parent.addChild(this.physicsBody);
};
