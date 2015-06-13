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
utils.getRandomFloat = function (min, max) {
    return Math.random() * (max - min) + min;
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
utils.getRadiusFromArea = function (area) {
    return Math.sqrt(area / Math.PI);
};

utils.sqr = function (x) {
  return x * x;
};

utils.dist2 = function(v, w) {
  return utils.sqr(v.x - w.x) + utils.sqr(v.y - w.y);
};

utils.distToSegmentSquared = function(p, v, w) {
  var l2 = utils.dist2(v, w);
  if (l2 === 0) return utils.dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  if (t < 0) return utils.dist2(p, v);
  if (t > 1) return utils.dist2(p, w);
  return utils.dist2(p, { x: v.x + t * (w.x - v.x),
                          y: v.y + t * (w.y - v.y) });
};

utils.distToSegment = function (p, v, w) {
  return Math.sqrt(utils.distToSegmentSquared(p, v, w));
};

Array.prototype.getRandomItem = function () {
    var i = utils.getRandomInt(0, this.length - 1);
    return this[i];
};
navigator.sayswho= (function(){
    var ua= navigator.userAgent, tem,
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();
