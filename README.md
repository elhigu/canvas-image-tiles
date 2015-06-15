## Rotate, scale and position huge (over 100Mpixel) input image and split it to tiles with html5 canvas
Checkout the online demo: http://elhigu.github.io/canvas-image-tiles

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

## Compatibility notes
On OSX Safari sampling tiles from over 100M pixel images pauses every now and then. Timeline doesn't show any apparent reason why that is happening.

iOS cannot load big images from file, but if one tries to load over few megapixel image it will get
down sampled before it is given to javascript side http://stackoverflow.com/questions/15542045/mobile-safari-downsamples-large-images-how-to-retain
Also really big images just fail silently.

On IE really big images didn't work perfectly some not enough storage error occurred.

Please let me know if you try this with some other browsers to know how it works :)

