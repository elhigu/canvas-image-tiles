## Rotate, scale and position huge (over 100Mpixel) input image and split it to tiles with html5 canvas
Checkout the online demo and explication page: http://elhigu.github.io/canvas-image-tiles

## Implementation
Plain html/css/javascript uses `hammer.js` to support touch screen events.

Canvas / preview creation transformation calculations etc. is in separate class to make it as
easy as possible to wrap to splitting to work with any framework.

## To play around with it
```
git clone https://github.com/elhigu/canvas-image-tiles.git
cd canvas-image-tiles
open index.html
```

## How to use CanvasShredder class

All the functionality to splitting pieces from source image is written in `CanvasShredder` class.

To create shredder instance one has to create preview area div and load image which is used
as full size version of source.

`CanvasShredder` creates preview canvas that is smaller scale version of source image which
is used to show preview of full sized image on preview area.

### Setup an area where to show and adjust preview

Preview area is just plain `<div></div>` elment. When `CanvasShredder` is created, it creates
and appends preview canvas in the end of this element.

### Load image somehow to image element

Easy way to load image, if you have it online would be just to create img element that is
not attached to DOM

```javascript
var image = document.createElement('img');
image.onload = function() { /* image ready to be with for CanvasShredder class */ };
image.src = "http://vignette4.wikia.nocookie.net/trekcreative/images/7/78/Galaxy_Map-Huge.jpg";
```

To select local file on may use `<input type='file'>`and

```javascript
function handleFileSelect(evt) {
  var files = evt.target.files;
  var file = files[0]; // just read the first selected file
  var image = document.createElement('img');
  image.onload = function() {
  };
  image.src = URL.createObjectURL(f);
}
fileInput.addEventListener('change', handleFileSelect, false);
```

### Create CanvasShredder class

Canvas shredder creates preview canvas to preview area and does all the calculations for
showing preview canvas in correct orientation. It also provides method to slice piece of
full sized source image to destination canvas

```javascript
var shredder = new CanvasShredder(image, previewArea, {storeOriginalInCanvas: true});
```

Class also supports option `noCssAutoUpdate` which disables auto update of setting
preview canvas inline CSS styles according to changes in orientation.

### Adjust orientation (preview scale, rotation / place)

To change image orientation and place on preview area is done with

```javascript
shredder.updateOrientation({
  deltaRotation: Math.PI/100,
  absPosition: { x: 0, y: 0 },
  absScale : Math.sin(shredder.rotation) + 0.1
});
```

Orientation can be given either with absolute or delta values. Absolute values sets value directly
and delta values are changes relative to old orientation.

`updateOrientation` automatically schedules updating CSS transformation for preview canvas
to happen on next `requestAnimationFrame`.

One can also disable auto update by passing `{ noCssAutoUpdate: true }` to constructor and
get CSS transformation with `shredder.getPreviewCssTransform()` to be able to update
preview canvas CSS manually.

To read current orientation one may directly read them from `shredder.rotation`,
`shredder.scale` and `shredder.position`.

`position` is pixel coordinates from top-left corner of preview area.

`scale` is scale of preview canvas e.g. `1.0` means that preview is shown full scale so
its width or height is `2048px`.

### Slice piece of source image to destination canvas

Finally to read piece from full size source image to destination canvas is done by

```javascript
shredder.slice(previewAreaX, previewAreaY, previewAreaSize, dstCanvas);
```

`previewAreaX` and `previewAreaY` are pixel coordinates in preview area where to start reading
pixels to destination.

`previewAreaSize` is pixel width and height how big piece of preview area is captured to
destination canvas.

If one makes captured area size smaller, effectively image written to destination is zoomed in.

In the other hand if one writes whole preview area (from `(0,0)` and `previewAreaSize` is width of area)
one will get whole preview area written to destination canvas. Effectively one draws preview
area with smaller resolution to destination (supposing that destination is e.g. `256x256` and preview
area `1024x1024`).

So to make zooming, there are 2 different ways, by actually changing `scale` or by reading smaller are
from preview area.

## Compatibility notes
On OSX Safari sampling tiles from over 100M pixel images pauses every now and then. Timeline doesn't show any apparent
reason why that is happening (happens only when trying to read frames 60fps).

iOS cannot load big images from file, but if one tries to load over few megapixel image it will get
down sampled before it is given to javascript side http://stackoverflow.com/questions/15542045/mobile-safari-downsamples-large-images-how-to-retain
Also really big images just fail silently.

On IE really big images didn't work perfectly some not enough storage error occurred ().

Please let me know if you try this with some other browsers to know how it works :)

