var fileInput = document.getElementById('file-input');
var canvas = document.getElementById('tile-out');
var fpsCounter = document.getElementById('fps');
var imageInfo = document.getElementById('image-info');

var sourceReady = false;
var sourceCanvas = document.createElement('canvas');
var previewCanvas = document.getElementById('preview');

var orientation = {
  scale: 0.2,
  rotation: 0,
  position: {
    x: 0,
    y: 0
  },
  getTransform: function () {
    return "translateX(-40%) translateY(-40%) scale(0.2) rotate(1deg);";
  }
};

/**
 * Load image data from file and create original sized canvas from it for
 * generating tiles and lower resolution preview for showing it in screen.
 * 
 * Image element could be used directly as a source for creating tiles, but
 * e.g. Chrome did automatically store image in GPU memory, which caused 
 * reading image for creating tiles with drawImage to be really slow.
 */
function handleFileSelect(evt) {
  previewCanvas.width = 200;
  previewCanvas.height = 200;
  var ctx = previewCanvas.getContext('2d');
  ctx.fillStyle = "blue";
  ctx.font = "bold 16px Arial";
  ctx.fillText("Loading....", 0, 100);

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

    // scale, rotate, position for receiving canvas
    var scale = Math.random()*2;
    context.scale(scale,scale)
    context.rotate(Math.random()*Math.PI*2);
    context.translate(-sourceCanvas.width*Math.random(), -sourceCanvas.height*Math.random());

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
  console.log("Clicketi click", event, el.offsetTop, el.offsetLeft);
}
selectorGrid.addEventListener('click', onGridCellClick, false);

/**
 * Adjust preview position on top of tiles.
 */
