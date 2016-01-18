function swirl(ctx, x, y, radius, amount, maskRadius) {
    amount = amount || 1;
    x -= radius;
    y -= radius;
    var width = radius * 2,
        height = width;
    var centerX = radius,
        centerY = radius;
    var imgData = ctx.getImageData(x, y, width, height),
        originalPixels = imgData.data;
    var transformedData = ctx.createImageData(imgData),
        transformedPixels = transformedData.data;

    for (var _x = -radius; _x < radius; ++_x) {
        for (var _y = -radius; _y < radius; ++_y) {
            var hypotSqr = _x * _x + _y * _y;
            var destPos = ((_y + centerY) * width + _x + centerX) * 4;
            if (hypotSqr <= radius * radius && hypotSqr > maskRadius * maskRadius) {
                var newY, newX, sourcePos;
                var r = Math.sqrt(hypotSqr),
                    a = Math.atan2(_y, _x),
                    deg = a * 180 / Math.PI;

                var m = r - radius;
                deg += m * (m / (radius / 2)) * amount;

                a = deg * Math.PI / 180;
                newX = Math.floor(r * Math.cos(a));
                newY = Math.floor(r * Math.sin(a));

                sourcePos = ((newY + centerY) * width + newX + centerX) * 4;

                transformedPixels[destPos + 0] = originalPixels[sourcePos + 0];
                transformedPixels[destPos + 1] = originalPixels[sourcePos + 1];
                transformedPixels[destPos + 2] = originalPixels[sourcePos + 2];
                transformedPixels[destPos + 3] = originalPixels[sourcePos + 3];
            } else {
                transformedPixels[destPos + 0] = originalPixels[destPos + 0];
                transformedPixels[destPos + 1] = originalPixels[destPos + 1];
                transformedPixels[destPos + 2] = originalPixels[destPos + 2];
                transformedPixels[destPos + 3] = originalPixels[destPos + 3];
            }

        }
    }
    ctx.putImageData(transformedData, x, y);
}