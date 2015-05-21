var utils = utils || {};
utils.merge = function(obj1, obj2) {
    var obj = {};
    for (var p1 in obj1) {
        if (obj1.hasOwnProperty(p1))
            obj[p1] = obj1[p1];
    }
    for (var p2 in obj2) {
        if (obj2.hasOwnProperty(p2))
            obj[p2] = obj2[p2];
    }
    return obj;
};
utils.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
utils.getAverage = function () {
    var total = 0;
    for (var i = 0; i < arguments.length; i++) {
        total += arguments[i];
    }
    return total / arguments.length;
};
utils.getAverageWithRatio = function (n1, n2, ratio) {
    return Math.abs(n2 - n1) * ratio + Math.min(n1, n2);
};
utils.hexToRgb = function (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};
utils.rgbToHex = function (r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};
