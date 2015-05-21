var fileInput = document.getElementById('file-input');
var canvas = document.getElementById('tile-out');
var fpsCounter = document.getElementById('fps');
var imageInfo = document.getElementById('image-info');

var sourceReady = false;
var sourceCanvas = document.createElement('canvas');
var previewCanvas = document.getElementById('preview');

/**
 * Orientation, how image was moved... could write this as real class...
 */
var previewLocator = document.getElementById('source-locator');
// make this to be class
var orientation = {
  selectedGridPos: { x: 0, y: 0},
  scale: 0.2,
  rotation: 0,
  position: {
    x: 0,
    y: 0
  },
  waitForUpdate: false,
  updateOrientation: function (update) {
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
    }

    if (!this.waitForUpdate) {
      this.waitForUpdate = true;
      requestAnimationFrame(function () {
        console.log("Updating transform...", this.getTransform());
        this.waitForUpdate = false;
        previewLocator.style.transform = this.getTransform();
      }.bind(this));
    }
  },
  initFromLoadedImage: function (previewCanvas, fullCanvas) {
    this.previewScale = previewCanvas.width / fullCanvas.width;
    // good scale for image to fit 512x512 area
    this.scale = 0.2;
    this.rotation = 0;
    // put scaled image to center of grid
    this.position.x = 0;
    this.position.y = 0;
    this.updateOrientation(); // trigger updating style
  },
  getTransform: function () {
    var posOffsetX = -previewCanvas.width/2 + 256;
    var posOffsetY = -previewCanvas.height/2 + 256;
    return [
      "translateX(" + (this.position.x + posOffsetX) + "px)",
      "translateY(" + (this.position.y + posOffsetY) + "px)",
      "scale(" + this.scale + ")",
      "rotate(" + this.rotation + "rad)"
    ].join(" ");
  }
};

/**
 * Load image data from file and create original sized canvas from it for
 * generating tiles and lower resolution preview for showing it in screen.
 * 
 * Image element could be used directly as a source for craeating tiles, but
 * e.g. Chrome did automatically store image in GPU memory, which caused 
 * reading image for creating tiles with drawImage to be really slow.
 */
var gridCenterEl = document.querySelector('#tile-selector-grid .cell:nth-child(28)');
function handleFileSelect(evt) {
  previewCanvas.width = 512;
  previewCanvas.height = 512;
  var ctx = previewCanvas.getContext('2d');
  ctx.fillStyle = "blue";
  ctx.font = "bold 28px Arial";
  ctx.fillText("Behold...", 128, 256);

	var files = evt.target.files;
	var output = [];
	for (var i = 0, f; f = files[i]; i++) {
    sourceReady = false;
    console.log(f);
    var reader = new FileReader();
    reader.onloadend = function (evt) {
      if (evt.target.readyState == FileReader.DONE) {
        // load data to image element, to be able to create preview and
        // original image canvases
        var newImage = document.createElement('img');

        newImage.onload = function() {
          sourceReady = true;
          sourceCanvas.width = newImage.naturalWidth;
          sourceCanvas.height = newImage.naturalHeight;

          // copy image to canvas, to prevent img tag being stored in GPU memory
          // which did slow down slicing hugely on chrome 
          // (or we could write webgl slicing for that case)...
          var sourceCtx = sourceCanvas.getContext('2d');
          sourceCtx.drawImage(newImage, 0, 0);

          // create smaller preview canvas
          var aspectRatio = sourceCanvas.width / sourceCanvas.height;
          var isHeightBigger = aspectRatio < 1;
          if (isHeightBigger) {
            previewCanvas.height = 2048;
            previewCanvas.width = aspectRatio*previewCanvas.height;
          } else {
            previewCanvas.width = 2048;
            previewCanvas.height = previewCanvas.width/aspectRatio;
          }
          var previewCtx = previewCanvas.getContext('2d');
          previewCtx.drawImage(sourceCanvas, 
            0,0,sourceCanvas.width,sourceCanvas.height,
            0,0,previewCanvas.width,previewCanvas.height
          );
          orientation.initFromLoadedImage(previewCanvas, sourceCanvas);
          gridCenterEl.click();
          imageInfo.textContent = sourceCanvas.width + "x" + sourceCanvas.height;
        };
        newImage.src = evt.target.result;
      }
    };
    reader.readAsDataURL(f);
  }
}
fileInput.addEventListener('change', handleFileSelect, false);

/**
 * Sample tile from source image on every animationFrame.
 */
var frameCount = 0;
function slicePieceToCanvas() {
  if (sourceReady) {
    // clear canvas
    canvas.width = canvas.width;
    var context = canvas.getContext('2d');
    context.save();

    // offset position according to how image is moved from center point and which grid position was selected
    var srcX = orientation.position.x - (orientation.selectedGridPos.x-64*4);
    var srcY = orientation.position.y - (orientation.selectedGridPos.y-64*4);
    context.translate(srcX*4, srcY*4);

    // scale, rotate, position for receiving canvas
    var scale = orientation.scale*orientation.previewScale*(256/64);
    context.scale(scale,scale);
    context.rotate(orientation.rotation);
    // origo for scaling and rotate to center of the image
    context.translate(-sourceCanvas.width/2, -sourceCanvas.height/2);
    context.drawImage(sourceCanvas, 0, 0);
    context.restore();
  }
  frameCount++;
  requestAnimationFrame(slicePieceToCanvas);    
}
// start render loop on next animation frame
requestAnimationFrame(slicePieceToCanvas);

/**
 * Update fps counter every 2 secs if image data is ready.
 */
var previousFrameCount = 0;
var previousMilliseconds = new Date().getTime();
function updateFps() {
  var currentMs = new Date().getTime();
  var framesPassed = frameCount - previousFrameCount;
  var millisecondsPassed = currentMs - previousMilliseconds;
  var fps = framesPassed/(millisecondsPassed/1000);
  fpsCounter.textContent = fps;
  previousFrameCount = frameCount;
  previousMilliseconds = currentMs;
}
setInterval(updateFps, 2000);

/**
 * Select bounding box where tile should tile should be read from.
 */
var selectorGrid = document.getElementById('tile-selector-grid');
var previouslySelected = null;
function onGridCellClick(event) {
  var el = event.target;
  if (previouslySelected) {
    previouslySelected.removeAttribute('selected');
  }
  el.setAttribute('selected', true);
  previouslySelected = el;
  orientation.selectedGridPos = { x: el.offsetLeft, y: el.offsetTop };
  console.log("Selected grid position", event, el.offsetTop, el.offsetLeft);
}
selectorGrid.addEventListener('click', onGridCellClick, false);

/**
 * Adjust preview position on top of tiles.
 */
var rotationButton = document.querySelector('.ctrl-btn.rotate');
var moveButton = document.querySelector('.ctrl-btn.move');
var scaleButton = document.querySelector('.ctrl-btn.scale');

var moveEl = null;
var lastPos = null;
function getPos(event) {
  return { x: event.screenX, y: event.screenY };
}

rotationButton.addEventListener('mousedown', startMouseMove, false);
moveButton.addEventListener('mousedown', startMouseMove, false);
scaleButton.addEventListener('mousedown', startMouseMove, false);
function startMouseMove(event) {
  event.preventDefault();
  moveEl = event.target;
  lastPos = getPos(event);
}

/**
 * Convert mousedown and mousemove events to relative mouse events
 */
function mouseMove(event) {
  if (event.buttons === 0) {
    moveEl = null;
  }
  if (moveEl !== null) {
    var currPos = getPos(event);
    var dx = currPos.x - lastPos.x;
    var dy = currPos.y - lastPos.y;
    var speed = Math.sqrt(dx*dx + dy*dy);
    speed = (dy > 0) ? speed : -speed;
    moveEl.dispatchEvent(new CustomEvent('relativemouse', { detail: {
      dx: dx,
      dy: dy,
      speed: speed
    }}));
    lastPos = currPos;
  }
}
document.body.addEventListener('mousemove', mouseMove, false);

/**
 * Adjust image orientation
 */
rotationButton.addEventListener('relativemouse', function (event) {
  orientation.updateOrientation({ deltaRotation: event.detail.speed/100 });
}, false);
moveButton.addEventListener('relativemouse', function (event) {
  orientation.updateOrientation({
    deltaPosition: { x: event.detail.dx, y: event.detail.dy }
  });
}, false);
scaleButton.addEventListener('relativemouse', function (event) {
  orientation.updateOrientation({ deltaScale: event.detail.speed/100 });
}, false);
