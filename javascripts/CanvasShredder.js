/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Mikael Lepistö
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH
 * THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Reads image data and create full sized canvas from it for generating tiles
 * and lower resolution preview for showing it in screen.
 *
 * Image element could be used directly as a source for creating tiles, but
 * e.g. Chrome did automatically store image in GPU memory, which caused
 * reading image for creating tiles with drawImage to be really slow.
 *
 * @param sourceImage Image DOM element where full input data is stored.
 * @param previewAreaEl DOM element where preview canvas is placed with append.
 * @param options {Object} Additional options.
 * @param options.storeOriginalInCanvas {boolean} Set this true to create
 *   internal non attached canvas element where full size input data is stored.
 *   Causes more memory load specially on mobile devices, but may make copying tiles
 *   faster (on some platforms copying from canvas->canvas is lot more efficient than
 *   img->canvas due to place where image is stored).
 * @constructor
 */
function CanvasShredder(sourceImage, previewAreaEl, options) {

  // initial origo is in the center of preview area
  this.initialOrigoX = previewAreaEl.offsetWidth/2;
  this.initialOrigoY = previewAreaEl.offsetHeight/2;

  if (options && options.storeOriginalInCanvas) {
    // full size canvas where from to copy data to tile
    var srcCanvas = document.createElement('canvas');
    srcCanvas.width = sourceImage.naturalWidth;
    srcCanvas.height = sourceImage.naturalHeight;
    var sourceCtx = srcCanvas.getContext('2d');
    sourceCtx.drawImage(sourceImage, 0, 0);
    this.srcCanvas = srcCanvas;
  } else {
    // use original image tag to store full size image
    var srcCanvas = sourceImage;
    this.srcCanvas = srcCanvas;
    srcCanvas.width = sourceImage.naturalWidth;
    srcCanvas.height = sourceImage.naturalHeight;
  }


  // create smaller preview canvas
  var previewCanvas = document.createElement('canvas');
  var aspectRatio = srcCanvas.width / srcCanvas.height;
  var isHeightBigger = aspectRatio < 1;
  if (isHeightBigger) {
    previewCanvas.height = 2048;
    previewCanvas.width = aspectRatio*previewCanvas.height;
  } else {
    previewCanvas.width = 2048;
    previewCanvas.height = previewCanvas.width/aspectRatio;
  }
  var previewCtx = previewCanvas.getContext('2d');
  previewCtx.drawImage(srcCanvas,
    0,0,srcCanvas.width,srcCanvas.height,
    0,0,previewCanvas.width,previewCanvas.height
  );
  previewAreaEl.appendChild(previewCanvas);
  this.previewCanvas = previewCanvas;
  this.previewScale = previewCanvas.width / srcCanvas.width;

  // TODO: calculate from viewWidth / viewHeight
  this.scale = 0.2;
  this.position = {x: 0, y:0};
  this.rotation = 0;
  this.waitForPreviewCssUpdate = false;
  this.updateOrientation();
}

/**
 * Remove preview canvas from DOM and clean up events.
 */
CanvasShredder.prototype.destroy = function () {
  this.previewCanvas.remove();
  this.previewCanvas = null;
};

/**
 * Change src image orientation and schedule preview canvas to be updated on next draw.
 *
 * @param update {Object=} Orientation change describer.
 * @param update.deltaRotation {Number} Rotation change.
 * @param update.deltaPosition {{ x: Number, y: Number }} Position change.
 * @param update.deltaScale {Number} Scale change.
 */
CanvasShredder.prototype.updateOrientation = function (update) {
  if (update) {
    if (update.deltaRotation) {
      this.rotation += update.deltaRotation;
    }
    if (update.deltaScale) {
      this.scale += update.deltaScale;
    }
    if (update.deltaPosition) {
      this.position.x += update.deltaPosition.x;
      this.position.y += update.deltaPosition.y;
    }
    if (update.absRotation) {
      this.rotation = update.absRotation;
    }
    if (update.absScale) {
      this.scale = update.absScale;
    }
    if (update.absPosition) {
      this.position.x = update.absPosition.x;
      this.position.y = update.absPosition.y;
    }
  }

  // update preview CSS before next paint
  if (!this.waitForPreviewCssUpdate) {
    this.waitForPreviewCssUpdate = true;
    requestAnimationFrame(function () {
      if (this.previewCanvas) {
        var transformCss = this.getPreviewCssTransform();
        this.previewCanvas.style.transform = transformCss;
        this.previewCanvas.style.WebkitTransform = transformCss;
        this.previewCanvas.style.MozTransform = transformCss;
        this.waitForPreviewCssUpdate = false;
      }
    }.bind(this));
  }
};

/**
 * Returns transformation for positioning preview canvas relative to preview area.
 * @returns {string} CSS transform string.
 */
CanvasShredder.prototype.getPreviewCssTransform = function () {
  var posOffsetX = -this.previewCanvas.width/2 + this.initialOrigoX;
  var posOffsetY = -this.previewCanvas.height/2 + this.initialOrigoY;
  var transform = [
    "translateX(" + (this.position.x + posOffsetX) + "px)",
    "translateY(" + (this.position.y + posOffsetY) + "px)",
    "scale(" + this.scale + ")",
    "rotate(" + this.rotation + "rad)"
  ].join(" ");
  return transform;
};

/**
 * Read piece of source canvas to destination according to src orientation and
 * given coordinates of preview area.
 *
 * @param x {Number} Pixel coordinate where from preview area slice should be read.
 * @param y {Number} Pixel coordinate where from preview area slice should be read.
 * @param sliceSize {Number} Pixel size in preview area how big square is read.
 * @param dstCanvas Canvas where to write slice. Must be square.
 */
CanvasShredder.prototype.slice = function (x, y, sliceSize, dstCanvas) {
  if (dstCanvas.width != dstCanvas.height) {
    throw new Error("Destination canvas should be square");
  }
  var tileSizePerSliceSize = dstCanvas.width / sliceSize;

  dstCanvas.width = dstCanvas.width; // clear canvas trick
  var context = dstCanvas.getContext('2d');
  context.save();

  // offset position according to how image is moved from center point and which grid position was selected
  var srcX = this.position.x - (x - this.initialOrigoX);
  var srcY = this.position.y - (y - this.initialOrigoY);
  context.translate(srcX*tileSizePerSliceSize, srcY*tileSizePerSliceSize);

  // scale, rotate, position for receiving canvas
  var scale = this.scale*this.previewScale*tileSizePerSliceSize;
  context.scale(scale,scale);
  context.rotate(this.rotation);
  // origo for scaling and rotate to center of the image
  context.translate(-this.srcCanvas.width/2, -this.srcCanvas.height/2);
  context.drawImage(this.srcCanvas, 0, 0);
  context.restore();
};
