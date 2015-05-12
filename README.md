## Create 256x256 tiles from huge (over 100Mpixel) input image with html5 canvas 
Checkout the online demo: http://elhigu.github.io/canvas-image-tiles

## To play around with it
```
git clone https://github.com/elhigu/canvas-image-tiles.git
cd canvas-image-tiles
open index.html
```

## Compatibility notes
On OSX Safari sampling tiles from over 100M pixel images pauses every now and then. Timeline doesn't show any apparent reason why that is happening.

On iOs fails silently if image is too big for mobile browser. Havent connected to debugger to see if there could be something to do to fix it...

On IE really big images didn't work perfectly some not enough storage error occured.

Please let me know if you try this with some other browsers to know how it works :)

